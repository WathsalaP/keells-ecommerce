from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List, Tuple
import os
import re
import requests

app = FastAPI(title="Keells AI Service", version="1.1.0")

# ✅ CORS (allow Vite frontend to call ai-service)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8080")  # Spring Boot
TIMEOUT = 10

# -----------------------------
# Models
# -----------------------------
class ChatRequest(BaseModel):
    sessionId: str
    message: str

class ChatResponse(BaseModel):
    reply: str
    data: Optional[Dict[str, Any]] = None

# -----------------------------
# In-memory session state
# -----------------------------
SESSIONS: Dict[str, Dict[str, Any]] = {}

def get_session(session_id: str) -> Dict[str, Any]:
    if session_id not in SESSIONS:
        SESSIONS[session_id] = {
            "awaiting_type": False,
            "awaiting_add_confirm": False,
            "suggested_product_id": None,
            "suggested_product_name": None,
            "last_candidates": [],
            "type_options": [],
        }
    return SESSIONS[session_id]

# Optional: frontend can call this when modal closes to reset server session
@app.delete("/session/{session_id}")
def reset_session(session_id: str):
    if session_id in SESSIONS:
        del SESSIONS[session_id]
    return {"ok": True}

# -----------------------------
# Helpers: backend calls
# -----------------------------
def backend_get(path: str, params: Optional[dict] = None) -> Any:
    url = f"{BACKEND_BASE_URL}{path}"
    r = requests.get(url, params=params, timeout=TIMEOUT)
    if r.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Backend GET failed: {r.status_code} {r.text}")
    return r.json()

def backend_post(path: str, token: str) -> Any:
    url = f"{BACKEND_BASE_URL}{path}"
    headers = {"Authorization": token}  # expects "Bearer <token>" from frontend
    r = requests.post(url, headers=headers, timeout=TIMEOUT)
    if r.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Backend POST failed: {r.status_code} {r.text}")
    try:
        return r.json()
    except:
        return {"ok": True}

# -----------------------------
# Unit conversion + price/unit
# (hidden from user; returned in data)
# -----------------------------
UNIT_MAP = {
    "g": ("g", 1.0),
    "kg": ("g", 1000.0),
    "ml": ("ml", 1.0),
    "l": ("ml", 1000.0),
    "pcs": ("pcs", 1.0),
    "pc": ("pcs", 1.0),
    "piece": ("pcs", 1.0),
    "pieces": ("pcs", 1.0),
}

def normalize_unit(unit: str) -> str:
    if not unit:
        return ""
    return unit.strip().lower()

def compute_price_per_unit(price: float, weight_value: Optional[float], weight_unit: Optional[str]) -> Optional[Tuple[float, str]]:
    if price is None or weight_value is None or weight_unit is None:
        return None
    unit = normalize_unit(weight_unit)
    if unit not in UNIT_MAP:
        return None
    base_unit, mult = UNIT_MAP[unit]
    base_qty = float(weight_value) * mult
    if base_qty <= 0:
        return None
    return (float(price) / base_qty, base_unit)

# -----------------------------
# Light intent + parsing
# -----------------------------
TYPE_KEYWORDS = [
    "cheddar", "mozzarella", "gouda", "processed", "wedges", "wedge",
    "sauce", "spread", "cream cheese", "ricotta", "parmesan", "slices"
]

UNRELATED_HINTS = [
    "weather", "movie", "song", "football", "cricket", "politics", "instagram",
    "whatsapp", "tiktok", "bitcoin", "love", "relationship", "joke", "meme",
    "programming", "java", "react", "spring", "sql"
]

COMPARE_HINTS = [
    "compare", "cheapest", "lowest", "best", "recommend", "suggest",
    "price per", "unit price", "alternative", "cheaper"
]

def is_unrelated(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in UNRELATED_HINTS)

def extract_brand_hint(text: str) -> Optional[str]:
    t = text.lower()
    m = re.search(r"(brand\s+)?([a-zA-Z0-9]+)\s+(only|brand)", t)
    if m:
        return m.group(2).strip()
    # also support: "only kotmale"
    m2 = re.search(r"only\s+([a-zA-Z0-9]+)", t)
    if m2:
        return m2.group(1).strip()
    return None

def guess_product_term(text: str) -> Optional[str]:
    t = text.lower().strip()
    if not t:
        return None
    stop = {"compare", "show", "me", "prices", "price", "best", "cheapest", "recommend", "suggest", "find", "i", "want", "need", "only", "please"}
    tokens = [w for w in re.findall(r"[a-zA-Z]+", t) if w not in stop]
    if not tokens:
        return None
    for key in ["cheese", "milk", "bread", "eggs", "butter", "yogurt", "juice", "water", "rice", "tea"]:
        if key in tokens:
            return key
    return tokens[0]

def find_cheese_types(products: List[dict]) -> List[str]:
    found = set()
    for p in products:
        s = f"{p.get('name','')} {p.get('description','')}".lower()
        for k in TYPE_KEYWORDS:
            if k in s:
                found.add(k)
    return sorted(found)

def filter_by_type(products: List[dict], type_kw: str) -> List[dict]:
    type_kw = type_kw.lower().strip()
    out = []
    for p in products:
        s = f"{p.get('name','')} {p.get('description','')}".lower()
        if type_kw in s:
            out.append(p)
    return out

def filter_by_term(products: List[dict], term: str) -> List[dict]:
    term = term.lower().strip()
    out = []
    for p in products:
        s = f"{p.get('name','')} {p.get('description','')}".lower()
        if term in s:
            out.append(p)
    return out

def filter_by_brand_name(products: List[dict], brand_hint: str) -> List[dict]:
    bh = brand_hint.lower().strip()
    out = []
    for p in products:
        bn = (p.get("brandName") or "").lower()
        if bn and bh in bn:
            out.append(p)
    return out

# -----------------------------
# Ranking + response payload
# -----------------------------
def rank_products(products: List[dict]) -> Tuple[List[dict], Optional[int], Optional[str]]:
    scored = []
    for p in products:
        display_price = p.get("discountedPrice") if p.get("discountedPrice") is not None else p.get("price")
        try:
            price_f = float(display_price) if display_price is not None else None
        except:
            price_f = None

        try:
            wv = float(p.get("weightValue")) if p.get("weightValue") is not None else None
        except:
            wv = None

        wu = p.get("weightUnit")
        ppu_info = compute_price_per_unit(price_f, wv, wu)
        if ppu_info:
            ppu, base_unit = ppu_info
        else:
            ppu, base_unit = None, None

        sort_key = ppu if ppu is not None else 10**18

        scored.append({
            "id": p.get("id"),
            "name": p.get("name"),
            "brandName": p.get("brandName") or None,
            "imageUrl": p.get("imageUrl") or None,
            "price": float(p.get("price")) if p.get("price") is not None else None,
            "discountedPrice": float(p.get("discountedPrice")) if p.get("discountedPrice") is not None else None,
            "isDiscounted": True if p.get("discountId") is not None else False,
            "weightValue": p.get("weightValue"),
            "weightUnit": p.get("weightUnit"),
            "unitPrice": float(ppu) if ppu is not None else None,      # hidden in UI text, used by frontend if needed
            "unitBase": base_unit,                                     # hidden in UI text
            "sortKey": sort_key,
        })

    scored.sort(key=lambda x: x["sortKey"])
    top = scored[0] if scored else None
    top_id = top["id"] if top else None
    top_name = top["name"] if top else None
    return scored[:10], top_id, top_name

def ui_reply_for_ranked(items: List[dict], best_name: str) -> str:
    lines = []
    for i, it in enumerate(items, start=1):
        name = it.get("name") or "—"
        brand = it.get("brandName") or "—"
        price = it.get("discountedPrice") if it.get("discountedPrice") is not None else it.get("price")
        wv = it.get("weightValue")
        wu = it.get("weightUnit")

        wtxt = f"{wv}{wu}" if (wv is not None and wu) else ""
        price_txt = f"LKR {float(price):.2f}" if price is not None else "LKR —"
        discount_badge = " • Discount available" if it.get("isDiscounted") else ""

        if wtxt:
            lines.append(f"{i}) {name} — {brand} • {wtxt} • {price_txt}{discount_badge}")
        else:
            lines.append(f"{i}) {name} — {brand} • {price_txt}{discount_badge}")

    list_txt = "\n".join(lines)

    return (
        f"Here are the best matches for you:\n\n"
        f"{list_txt}\n\n"
        f"✅ **Best suggestion: {best_name}**\n"
        f"Would you like me to add this item to your cart? (Yes / No)"
    )

# -----------------------------
# Chat endpoint
# -----------------------------
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, authorization: Optional[str] = Header(default=None)):
    session = get_session(req.sessionId)
    msg = (req.message or "").strip()
    low = msg.lower().strip()

    # Handle common "no thanks" anywhere
    if low in {"no thanks", "no thank you", "no", "nah", "not now", "cancel"}:
        if session.get("awaiting_add_confirm"):
            session["awaiting_add_confirm"] = False
            session["suggested_product_id"] = None
            session["suggested_product_name"] = None
            return ChatResponse(reply="No problem 🙂 Tell me what you want to compare next (e.g., “compare milk 1L”).")
        return ChatResponse(reply="No problem 🙂 Ask me to compare products anytime (e.g., “cheapest cheddar cheese”).")

    # 1) Confirm add-to-cart
    if session.get("awaiting_add_confirm") and session.get("suggested_product_id"):
        if low in {"yes", "y", "ok", "okay", "add", "sure"}:
            if not authorization:
                return ChatResponse(reply="Please login first. I need your login token to add items to cart.")

            pid = session["suggested_product_id"]
            backend_post(f"/api/user/cart/add/{pid}?quantity=1", token=authorization)

            session["awaiting_add_confirm"] = False
            session["suggested_product_id"] = None
            session["suggested_product_name"] = None

            return ChatResponse(reply="✅ Added to cart! Want to compare something else?")
        else:
            return ChatResponse(reply="Please reply **Yes** to add it to cart or **No** to cancel.")

    # 2) Cheese type clarification stage
    if session.get("awaiting_type") and session.get("last_candidates"):
        chosen = msg.lower().strip()
        types = session.get("type_options", [])

        if chosen.isdigit():
            idx = int(chosen) - 1
            if 0 <= idx < len(types):
                chosen = types[idx]

        filtered = filter_by_type(session["last_candidates"], chosen)
        if not filtered:
            return ChatResponse(reply=f"I couldn’t find that type. Choose one of: {', '.join(types)}")

        ranked, top_id, top_name = rank_products(filtered)
        session["awaiting_type"] = False
        session["awaiting_add_confirm"] = True
        session["suggested_product_id"] = top_id
        session["suggested_product_name"] = top_name

        reply = ui_reply_for_ranked(ranked, top_name or "the best item")
        return ChatResponse(reply=reply, data={"items": ranked, "bestProductId": top_id})

    # 3) Unrelated question handling
    if is_unrelated(msg) and not any(k in low for k in COMPARE_HINTS):
        return ChatResponse(
            reply="I’m your Keells shopping assistant 🙂 I can compare groceries and find best value items. "
                  "Try: “compare milk 1L”, “cheapest cheddar cheese”, or “Kotmale milk only”."
        )

    # 4) Normal compare flow
    term = guess_product_term(msg)
    brand_hint = extract_brand_hint(msg)

    products = backend_get("/api/public/products")
    if not isinstance(products, list):
        products = []

    candidates = filter_by_term(products, term) if term else products
    if brand_hint:
        candidates = filter_by_brand_name(candidates, brand_hint)

    if not candidates:
        return ChatResponse(
            reply="I couldn’t find matching products. Try another keyword like: milk, cheese, bread, eggs."
        )

    # Cheese special: ask type if multiple detected
    if term == "cheese":
        types = find_cheese_types(candidates)
        if len(types) >= 2:
            session["awaiting_type"] = True
            session["last_candidates"] = candidates
            session["type_options"] = types
            opts = "\n".join([f"{i+1}. {t}" for i, t in enumerate(types)])
            return ChatResponse(
                reply=(
                    "You searched **cheese**, but there are multiple types.\n"
                    "Which type do you want?\n\n"
                    f"{opts}\n\n"
                    "Reply with the type name (e.g., cheddar) or the number."
                )
            )

    ranked, top_id, top_name = rank_products(candidates)
    session["awaiting_add_confirm"] = True
    session["suggested_product_id"] = top_id
    session["suggested_product_name"] = top_name

    reply = ui_reply_for_ranked(ranked, top_name or "the best item")
    return ChatResponse(reply=reply, data={"items": ranked, "bestProductId": top_id})

@app.get("/health")
def health():
    return {"ok": True, "backend": BACKEND_BASE_URL}

@app.get("/debug/products")
def debug_products():
    data = backend_get("/api/public/products")
    return {"count": len(data), "first": data[0] if data else None}