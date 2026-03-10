import csv
import random

random.seed(42)

OUTPUT_FILE = "products_dataset_with_labels.csv"

# --- Your real items (must be included) ---
BASE_ITEMS = [
    dict(productName="Kotmale Fresh Milk", description="Full Cream 1L", category="Dairy & Eggs", brand="Kotmale", priceLKR=530, discountPercentage="", weightValue=1.0, weightUnit="L", labels="milk,fresh_milk,dairy,compare,cheapest"),
    dict(productName="Ambewela Fresh Milk", description="Full Cream 1L", category="Dairy & Eggs", brand="Ambewela", priceLKR=500, discountPercentage="", weightValue=1.0, weightUnit="L", labels="milk,fresh_milk,dairy,compare,cheapest"),
    dict(productName="Anchor Fresh Milk", description="Full Cream 500ml", category="Dairy & Eggs", brand="Anchor", priceLKR=450, discountPercentage="", weightValue=0.5, weightUnit="L", labels="milk,fresh_milk,dairy,compare,cheapest"),

    dict(productName="Kotmale Cheese Wedges", description="Cheese wedges 120g", category="Dairy & Eggs", brand="Kotmale", priceLKR=350, discountPercentage=20, weightValue=120, weightUnit="g", labels="cheese,cheese_wedges,dairy,compare,cheapest"),
    dict(productName="Rich Life Cheese Wedges", description="Cheese wedges 120g", category="Dairy & Eggs", brand="Rich Life", priceLKR=400, discountPercentage="", weightValue=120, weightUnit="g", labels="cheese,cheese_wedges,dairy,compare,cheapest"),
    dict(productName="Anchor Cheddar Cheese Slices", description="Cheddar cheese slices 400g", category="Dairy & Eggs", brand="Anchor", priceLKR=980, discountPercentage="", weightValue=400, weightUnit="g", labels="cheese,cheddar,dairy,compare,cheapest"),
    dict(productName="Ambewela Gouda Cheese", description="Gouda cheese 200g", category="Dairy & Eggs", brand="Ambewela", priceLKR=500, discountPercentage="", weightValue=200, weightUnit="g", labels="cheese,gouda,dairy,compare,cheapest"),

    dict(productName="Eggs Pack", description="Farm fresh eggs (6pcs)", category="Dairy & Eggs", brand="", priceLKR=350, discountPercentage="", weightValue=6, weightUnit="pcs", labels="eggs,dairy,compare,cheapest"),
    dict(productName="Orange Juice", description="Orange juice 1L", category="Beverages", brand="", priceLKR=450, discountPercentage=10, weightValue=1.0, weightUnit="L", labels="juice,orange_juice,beverage,compare,cheapest"),
    dict(productName="Mineral Water", description="Drinking water 1.5L", category="Beverages", brand="", priceLKR=120, discountPercentage="", weightValue=1.5, weightUnit="L", labels="water,beverage,compare,cheapest"),
    dict(productName="White Bread", description="Soft white bread loaf 250g", category="Bakery", brand="", priceLKR=400, discountPercentage="", weightValue=250, weightUnit="g", labels="bread,bakery,compare,cheapest"),
    dict(productName="Dates", description="Khalas Dates 500g", category="Fruits", brand="", priceLKR=1200, discountPercentage="", weightValue=500, weightUnit="g", labels="dates,fruit,compare,cheapest"),
]

# --- Pools to generate Sri Lankan grocery-like items ---
BRANDS = ["Kotmale", "Ambewela", "Anchor", "Rich Life", "Highland", "Elephant House", "MALIBAN", "MD", "Munchee", "Ruhunu", ""]
CATEGORIES = [
    "Dairy & Eggs", "Beverages", "Fruits", "Vegetables", "Bakery",
    "Frozen Foods", "Ice Cream", "Snacks", "Rice & Grains", "Spices", "Household"
]

# item templates: (nameBase, labelBase, possibleUnits)
ITEM_TEMPLATES = [
    ("Fresh Milk", "milk,fresh_milk,dairy", ["L", "ml"]),
    ("Yoghurt", "yoghurt,dairy", ["g"]),
    ("Butter", "butter,dairy", ["g"]),
    ("Cheddar Cheese", "cheese,cheddar,dairy", ["g"]),
    ("Mozzarella Cheese", "cheese,mozzarella,dairy", ["g"]),
    ("Cheese Wedges", "cheese,cheese_wedges,dairy", ["g"]),
    ("Gouda Cheese", "cheese,gouda,dairy", ["g"]),
    ("Eggs", "eggs,dairy", ["pcs"]),
    ("Orange Juice", "juice,orange_juice,beverage", ["L", "ml"]),
    ("Mango Juice", "juice,mango_juice,beverage", ["L", "ml"]),
    ("Mineral Water", "water,beverage", ["L", "ml"]),
    ("Tea", "tea,beverage", ["g"]),
    ("Coffee", "coffee,beverage", ["g"]),
    ("Banana", "banana,fruit", ["kg", "g"]),
    ("Apple", "apple,fruit", ["kg", "g"]),
    ("Orange", "orange,fruit", ["kg", "g"]),
    ("Grapes", "grapes,fruit", ["kg", "g"]),
    ("Carrot", "carrot,vegetable", ["kg", "g"]),
    ("Beans", "beans,vegetable", ["kg", "g"]),
    ("Pumpkin", "pumpkin,vegetable", ["kg", "g"]),
    ("Potato", "potato,vegetable", ["kg", "g"]),
    ("White Bread", "bread,bakery", ["g"]),
    ("Buns Pack", "buns,bakery", ["pcs"]),
    ("Sausages", "sausages,frozen", ["g"]),
    ("Fish Cutlets", "cutlets,frozen", ["pcs"]),
    ("Chicken Nuggets", "nuggets,frozen", ["g"]),
    ("Vanilla Ice Cream", "icecream,dessert", ["L", "ml"]),
    ("Chocolate Ice Cream", "icecream,dessert", ["L", "ml"]),
    ("Biscuits", "biscuits,snacks", ["g"]),
    ("Crackers", "crackers,snacks", ["g"]),
    ("Rice", "rice,grains", ["kg", "g"]),
    ("Flour", "flour,grains", ["kg", "g"]),
    ("Chili Powder", "spices,chili", ["g"]),
    ("Curry Powder", "spices,curry", ["g"]),
    ("Dish Wash Liquid", "household,cleaning", ["ml", "L"]),
]

def choose_weight(unit: str):
    if unit == "g":
        return random.choice([100, 120, 150, 200, 250, 400, 500, 750, 1000])
    if unit == "kg":
        return random.choice([0.25, 0.5, 1, 2, 5])
    if unit == "ml":
        return random.choice([200, 250, 330, 500, 750, 1000, 1500])
    if unit == "L":
        return random.choice([0.5, 1, 1.5, 2])
    if unit == "pcs":
        return random.choice([1, 2, 4, 6, 10, 12])
    return 1

def estimate_price(category: str, unit: str, weight):
    # rough price ranges to make the dataset realistic
    base = {
        "Dairy & Eggs": (180, 1200),
        "Beverages": (120, 900),
        "Fruits": (200, 1800),
        "Vegetables": (180, 1200),
        "Bakery": (150, 900),
        "Frozen Foods": (400, 2200),
        "Ice Cream": (350, 1600),
        "Snacks": (120, 900),
        "Rice & Grains": (180, 2600),
        "Spices": (80, 1200),
        "Household": (150, 2000),
    }.get(category, (150, 1500))

    # scale a bit with weight
    low, high = base
    w_factor = 1.0

    if unit in ["g", "ml"]:
        w_factor = max(0.6, min(2.5, float(weight) / 250.0))
    elif unit in ["kg", "L"]:
        w_factor = max(0.6, min(3.0, float(weight) / 1.0))
    elif unit == "pcs":
        w_factor = max(0.7, min(2.5, float(weight) / 6.0))

    price = random.uniform(low, high) * w_factor
    # round to typical store price
    return int(round(price / 10.0) * 10)

def maybe_discount():
    if random.random() < 0.22:  # 22% items discounted
        return random.choice([5, 10, 15, 20, 25, 30])
    return ""

def pick_category_for_item(nameBase: str):
    if "Milk" in nameBase or "Cheese" in nameBase or "Yoghurt" in nameBase or "Eggs" in nameBase or "Butter" in nameBase:
        return "Dairy & Eggs"
    if "Juice" in nameBase or "Water" in nameBase or "Tea" in nameBase or "Coffee" in nameBase:
        return "Beverages"
    if nameBase in ["Banana", "Apple", "Orange", "Grapes", "Dates"]:
        return "Fruits"
    if nameBase in ["Carrot", "Beans", "Pumpkin", "Potato"]:
        return "Vegetables"
    if "Bread" in nameBase or "Buns" in nameBase:
        return "Bakery"
    if "Ice Cream" in nameBase:
        return "Ice Cream"
    if nameBase in ["Sausages", "Fish Cutlets", "Chicken Nuggets"]:
        return "Frozen Foods"
    if nameBase in ["Biscuits", "Crackers"]:
        return "Snacks"
    if nameBase in ["Rice", "Flour"]:
        return "Rice & Grains"
    if "Powder" in nameBase:
        return "Spices"
    if "Dish Wash" in nameBase:
        return "Household"
    return random.choice(CATEGORIES)

def build_row():
    nameBase, labelBase, units = random.choice(ITEM_TEMPLATES)
    category = pick_category_for_item(nameBase)
    brand = random.choice(BRANDS)

    # force some branded dairy-like products to have a brand more often
    if category == "Dairy & Eggs" and brand == "" and random.random() < 0.65:
        brand = random.choice(["Kotmale", "Ambewela", "Anchor", "Rich Life", "Highland"])

    unit = random.choice(units)
    weight = choose_weight(unit)

    # make description more helpful
    desc_bits = []
    if "Cheese" in nameBase:
        desc_bits.append(random.choice(["slices", "block", "wedges", "spread"]))
    if category in ["Fruits", "Vegetables"]:
        desc_bits.append(random.choice(["fresh", "organic", "local"]))
    if category in ["Snacks"]:
        desc_bits.append(random.choice(["family pack", "mini pack", "regular"]))
    if category in ["Beverages"]:
        desc_bits.append(random.choice(["no added sugar", "classic", "fresh"]))
    description = " ".join(desc_bits).strip() or "Quality item"

    # build product name
    productName = f"{brand} {nameBase}".strip() if brand else nameBase
    # add size hint sometimes
    if random.random() < 0.5:
        productName += f" {weight}{unit}"

    price = estimate_price(category, unit, weight)
    disc = maybe_discount()

    # add generic labels required by your intents
    labels = set(labelBase.split(","))
    labels.update(["compare", "cheapest"])
    if disc != "":
        labels.add("discount")
    if brand:
        labels.add(f"brand_{brand.lower().replace(' ', '_')}")

    return dict(
        productName=productName,
        description=description,
        category=category,
        brand=brand,
        priceLKR=price,
        discountPercentage=disc,
        weightValue=weight,
        weightUnit=unit,
        labels=",".join(sorted(labels))
    )

def main():
    # We want ~420 total rows INCLUDING your real items
    target_total = 420
    rows = []

    # Add your real items first
    rows.extend(BASE_ITEMS)

    # Generate remaining rows
    while len(rows) < target_total:
        rows.append(build_row())

    # Write CSV
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "productName","description","category","brand",
                "priceLKR","discountPercentage","weightValue","weightUnit","labels"
            ]
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"✅ Generated {len(rows)} rows -> {OUTPUT_FILE}")

if __name__ == "__main__":
    main()