import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

/** Drag-to-scroll hook for horizontal rows */
function useDragScroll() {
  const ref = useRef(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const onMouseDown = (e) => {
    if (!ref.current) return;
    dragging.current = true;
    ref.current.classList.add("dragging");
    startX.current = e.pageX - ref.current.offsetLeft;
    startScrollLeft.current = ref.current.scrollLeft;
  };

  const onMouseLeave = () => {
    if (!ref.current) return;
    dragging.current = false;
    ref.current.classList.remove("dragging");
  };

  const onMouseUp = () => {
    if (!ref.current) return;
    dragging.current = false;
    ref.current.classList.remove("dragging");
  };

  const onMouseMove = (e) => {
    if (!ref.current || !dragging.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.2; // drag sensitivity
    ref.current.scrollLeft = startScrollLeft.current - walk;
  };

  const scrollByAmount = (amount) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove, scrollByAmount };
}

export default function Home() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const brandScroll = useDragScroll();
  const categoryScroll = useDragScroll();

  useEffect(() => {
    api.get("/public/brands").then((r) => setBrands(r.data));
    api.get("/public/categories").then((r) => setCategories(r.data));
  }, []);

  const promos = useMemo(
    () => [
      {
        title: "Save more every day",
        subtitle: "Keells Deals • Nexus Members Save",
        bg: "linear-gradient(135deg, #ff6a00, #ff2d55)",
        emoji: "🛍️",
        cta: "Shop Now",
        to: "/products",
      },
      {
        title: "Special Offers",
        subtitle: "Up to 25% OFF on selected items",
        bg: "linear-gradient(135deg, #6a11cb, #2575fc)",
        emoji: "🎁",
        cta: "View Deals",
        to: "/products",
      },
      {
        title: "Freshness guaranteed",
        subtitle: "Vegetables • Fruits • Daily essentials",
        bg: "linear-gradient(135deg, #ff9a00, #ff3d00)",
        emoji: "🥬",
        cta: "Shop Fresh",
        to: "/products",
      },
    ],
    []
  );

  const SectionHeader = ({ title, subtitle, onOpenShop, leftClick, rightClick }) => (
    <div
      style={{
        marginTop: 10,
        marginBottom: 10,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <h1 style={{ marginBottom: 6 }}>{title}</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 0 }}>{subtitle}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* arrows */}
        <button
          type="button"
          className="scroll-btn"
          onClick={leftClick}
          aria-label={`${title} scroll left`}
          title="Scroll left"
        >
          ‹
        </button>
        <button
          type="button"
          className="scroll-btn"
          onClick={rightClick}
          aria-label={`${title} scroll right`}
          title="Scroll right"
        >
          ›
        </button>

        {/* open shop */}
        <button className="btn btn-outline" onClick={onOpenShop}>
          Open shop →
        </button>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ paddingBottom: 40 }}>
      {/* HERO PROMOS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 18,
          marginTop: 10,
          marginBottom: 26,
        }}
      >
        {promos.map((p, idx) => (
          <div
            key={idx}
            onClick={() => navigate(p.to)}
            style={{
              gridColumn: "span 4",
              cursor: "pointer",
              borderRadius: 18,
              padding: "26px 24px",
              color: "white",
              background: p.bg,
              minHeight: 260,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
              userSelect: "none",
            }}
          >
            <div style={{ fontSize: 46, opacity: 0.9 }}>{p.emoji}</div>
            <h2 style={{ margin: "10px 0 6px", fontSize: 28, lineHeight: 1.15 }}>
              {p.title}
            </h2>
            <div style={{ opacity: 0.9, marginBottom: 18 }}>{p.subtitle}</div>

            <button
              className="btn btn-primary"
              style={{
                background: "rgba(255,255,255,0.95)",
                color: "#1f3b1f",
                border: "none",
                padding: "10px 14px",
                borderRadius: 10,
                fontWeight: 700,
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(p.to);
              }}
            >
              {p.cta} →
            </button>

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                right: -50,
                bottom: -60,
                width: 240,
                height: 240,
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
              }}
            />
          </div>
        ))}
      </div>

      {/* BRANDS */}
      <SectionHeader
        title="Brands"
        subtitle="Choose a brand to view products."
        onOpenShop={() => navigate("/products")}
        leftClick={() => brandScroll.scrollByAmount(-520)}
        rightClick={() => brandScroll.scrollByAmount(520)}
      />

      <div
        ref={brandScroll.ref}
        className="hscroll"
        onMouseDown={brandScroll.onMouseDown}
        onMouseLeave={brandScroll.onMouseLeave}
        onMouseUp={brandScroll.onMouseUp}
        onMouseMove={brandScroll.onMouseMove}
      >
        {brands.map((b) => (
          <div
            key={b.id}
            className="hcard"
            onClick={() => navigate(`/brands/${slugify(b.name)}`)}
          >
            <div className="hcard-img">
              {b.logoUrl ? (
                <img src={b.logoUrl} alt={b.name} />
              ) : (
                <div style={{ fontSize: 46, opacity: 0.55 }}>🏷️</div>
              )}
            </div>

            <div className="hcard-body">
              <h3 style={{ margin: 0, marginBottom: 6 }}>{b.name}</h3>
              <div className="hcard-desc">{b.description || " "}</div>
              <div className="hcard-cta">Browse →</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
        Tip: drag horizontally (mouse grab) to see more →
      </div>

      {/* CATEGORIES */}
      <SectionHeader
        title="Categories"
        subtitle="Browse by category and find items faster."
        onOpenShop={() => navigate("/products")}
        leftClick={() => categoryScroll.scrollByAmount(-520)}
        rightClick={() => categoryScroll.scrollByAmount(520)}
      />

      <div
        ref={categoryScroll.ref}
        className="hscroll"
        onMouseDown={categoryScroll.onMouseDown}
        onMouseLeave={categoryScroll.onMouseLeave}
        onMouseUp={categoryScroll.onMouseUp}
        onMouseMove={categoryScroll.onMouseMove}
      >
        {categories.map((c) => (
          <div
            key={c.id}
            className="hcard hcard--category"
            onClick={() => navigate(`/products?category=${c.id}`)}
          >
            <div className="hcard-img hcard-img--category">
              {c.imageUrl ? (
                <img src={c.imageUrl} alt={c.name} />
              ) : (
                <div style={{ fontSize: 46, opacity: 0.55 }}>🧺</div>
              )}
            </div>

            <div className="hcard-body">
              <h3 style={{ margin: 0, marginBottom: 6 }}>{c.name}</h3>
              <div className="hcard-desc">{c.description || " "}</div>
              <div className="hcard-cta">Browse →</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
        Tip: drag horizontally (mouse grab) to see more →
      </div>

      {/* Styles (hide scrollbar + drag cursor + arrows) */}
      <style>{`
        /* responsive promos */
        @media (max-width: 1100px) {
          .container > div[style*="grid-template-columns: repeat(12"] > div {
            grid-column: span 12 !important;
          }
        }

        /* horizontal scroller */
        .hscroll{
          display:flex;
          gap:16px;
          overflow-x:auto;
          padding-bottom:10px;
          scroll-snap-type:x mandatory;
          user-select:none;
          cursor: grab;

          /* hide scrollbar */
          scrollbar-width: none;        /* Firefox */
          -ms-overflow-style: none;     /* IE/Edge */
        }
        .hscroll::-webkit-scrollbar{ display:none; } /* Chrome/Safari */

        .hscroll.dragging{
          cursor: grabbing;
        }

        /* card style (shared brands + categories) */
        .hcard{
          scroll-snap-align:start;
          min-width:320px;
          max-width:320px;
          flex:0 0 auto;
          cursor:pointer;
          background:white;
          border-radius:18px;
          box-shadow:0 10px 25px rgba(0,0,0,0.08);
          overflow:hidden;
          transition:0.25s;
        }
        .hcard:hover{
          transform: translateY(-4px);
          box-shadow:0 14px 30px rgba(0,0,0,0.12);
        }
        .hcard-img{
          height:160px;
          background:rgba(0,0,0,0.03);
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .hcard-img img{
          width:100%;
          height:100%;
          object-fit:cover;
        }
        .hcard-body{ padding:16px; }
        .hcard-desc{
          color:var(--text-muted);
          font-size:13px;
          min-height:32px;
        }
        .hcard-cta{
          margin-top:10px;
          color:var(--keells-green);
          font-weight:700;
        }

        /* category size difference (optional) */
        .hcard--category{
          min-width:280px;
          max-width:280px;
        }
        .hcard-img--category{
          height:140px;
        }

        /* arrow buttons */
        .scroll-btn{
          width:38px;
          height:38px;
          border-radius:999px;
          border:1px solid var(--border);
          background:white;
          color:var(--keells-green);
          font-size:22px;
          line-height:1;
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          transition:0.2s;
        }
        .scroll-btn:hover{
          transform: translateY(-1px);
          box-shadow:0 8px 18px rgba(0,0,0,0.10);
        }
      `}</style>
    </div>
  );
}