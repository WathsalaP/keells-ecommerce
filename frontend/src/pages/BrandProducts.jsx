import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function BrandProducts() {
  const { slug } = useParams();
  const { user, isAdmin } = useAuth();
  const { showNotification } = useNotification();

  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/public/brands").then(r => setBrands(r.data));
  }, []);

  const matchedBrand = useMemo(() => {
    return brands.find(b => slugify(b.name) === slug) || null;
  }, [brands, slug]);

  useEffect(() => {
    setBrand(matchedBrand);
    if (!matchedBrand) return;
    api.get(`/public/products?brandId=${matchedBrand.id}`).then(r => setProducts(r.data));
  }, [matchedBrand]);

  const addToCart = async (productId) => {
    if (!user || isAdmin) return;
    try {
      await api.post(`/user/cart/add/${productId}?quantity=1`);
      showNotification("Product added to cart!", "success");
    } catch (e) {
      showNotification(e.response?.data?.error || "Failed to add product", "error");
    }
  };

  if (!brand) {
    return (
      <div className="container">
        <h1>Brand</h1>
        <p style={{ color: "var(--text-muted)" }}>Brand not found.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt={brand.name} style={{ width: 56, height: 56, objectFit: "contain" }} />}
        <div>
          <h1 style={{ margin: 0 }}>{brand.name}</h1>
          <div style={{ color: "var(--text-muted)" }}>{brand.description}</div>
        </div>
      </div>

      <div className="products-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <div className="product-image">
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <span>🛒</span>}
            </div>

            <div className="product-info">
              <h3>{p.name}</h3>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {p.brandLogo && <img src={p.brandLogo} alt={p.brandName} style={{ width: 30, height: 30, objectFit: "contain" }} />}
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{p.brandName}</span>
              </div>

              <div>
                <span className="price">LKR {p.discountedPrice?.toFixed(2) || p.price?.toFixed(2)}</span>
                {p.discountedPrice && p.discountedPrice < p.price && (
                  <span className="original-price">LKR {p.price?.toFixed(2)}</span>
                )}
              </div>

              {!isAdmin && user && (
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: "0.75rem" }}
                  onClick={() => addToCart(p.id)}
                  disabled={!p.stockQuantity}
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}