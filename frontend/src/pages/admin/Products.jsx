import { useState, useEffect } from "react";
import api from "../../api";

const UNITS = ["g", "kg", "ml", "L", "pcs"];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [brands, setBrands] = useState([]);

  // editing: null = closed, 0 = add new, >0 = edit existing
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: 0,
    imageUrl: "",
    // ✅ NEW
    weightValue: "",
    weightUnit: "g",

    categoryId: "",
    brandId: "",
    discountId: "",
    active: true,
  });

  const load = () => {
    api.get("/admin/products").then((r) => setProducts(r.data));
    api.get("/admin/categories").then((r) => setCategories(r.data));
    api.get("/admin/discounts").then((r) => setDiscounts(r.data));
    api.get("/admin/brands").then((r) => setBrands(r.data)).catch(() => setBrands([]));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(0);
    setForm({
      name: "",
      description: "",
      price: "",
      stockQuantity: 0,
      imageUrl: "",
      weightValue: "",
      weightUnit: "g",
      categoryId: "",
      brandId: "",
      discountId: "",
      active: true,
    });
  };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p?.name || "",
      description: p?.description || "",
      price: p?.price?.toString() || "",
      stockQuantity: p?.stockQuantity ?? 0,
      imageUrl: p?.imageUrl || "",
      weightValue: p?.weightValue?.toString?.() || "",
      weightUnit: p?.weightUnit || "g",
      categoryId: p?.categoryId ?? "",
      brandId: p?.brandId ?? "",
      discountId: p?.discountId ?? "",
      active: p?.active ?? true,
    });
  };

  const closeForm = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      brandId: form.brandId ? Number(form.brandId) : null,
      discountId: form.discountId ? Number(form.discountId) : null,
      stockQuantity: Number(form.stockQuantity || 0),
      active: form.active !== false,

      // ✅ NEW
      weightValue: form.weightValue ? Number(form.weightValue) : null,
      weightUnit: form.weightValue ? form.weightUnit : null, // if no value, keep null
    };

    try {
      if (editing && editing !== 0) {
        await api.put(`/admin/products/${editing}`, payload);
      } else {
        await api.post("/admin/products", payload);
      }
      closeForm();
      load();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to save product");
    }
  };

  const del = (id) => {
    if (confirm("Delete?")) {
      api.delete(`/admin/products/${id}`).then(load);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: "1.5rem" }}>Manage Products</h1>

      <button className="btn btn-primary" onClick={openAdd} style={{ marginBottom: "1rem" }}>
        + Add Product
      </button>

      {editing !== null && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3>{editing && editing !== 0 ? "Edit" : "Add"} Product</h3>

          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label>Price (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>

            <div className="form-group">
              <label>Product Image URL (or /uploads/products/xxx.png)</label>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </div>

            {/* ✅ NEW: weight input */}
            <div className="form-group">
              <label>Weight / Volume (Optional)</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 500"
                  value={form.weightValue}
                  onChange={(e) => setForm({ ...form, weightValue: e.target.value })}
                  style={{ flex: 1 }}
                />
                <select
                  value={form.weightUnit}
                  onChange={(e) => setForm({ ...form, weightUnit: e.target.value })}
                  style={{ width: 120 }}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <small style={{ color: "var(--text-muted)" }}>
                Example: 500 g, 1 L, 12 pcs. Leave empty if not applicable.
              </small>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  value={form.stockQuantity}
                  onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Brand (Optional)</label>
                <select value={form.brandId || ""} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
                  <option value="">None</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Discount</label>
                <select value={form.discountId || ""} onChange={(e) => setForm({ ...form, discountId: e.target.value })}>
                  <option value="">None</option>
                  {discounts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.percentage}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-outline" onClick={closeForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Name</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Category</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Brand</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Weight</th>
              <th style={{ textAlign: "right", padding: "0.75rem" }}>Price</th>
              <th style={{ textAlign: "right", padding: "0.75rem" }}>Stock</th>
              <th style={{ padding: "0.75rem" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.75rem" }}>{p.name}</td>
                <td style={{ padding: "0.75rem" }}>{p.categoryName}</td>
                <td style={{ padding: "0.75rem" }}>{p.brandName || "—"}</td>
                <td style={{ padding: "0.75rem" }}>
                  {p.weightValue && p.weightUnit ? `${p.weightValue} ${p.weightUnit}` : "—"}
                </td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>LKR {p.price?.toFixed(2)}</td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>{p.stockQuantity}</td>
                <td style={{ padding: "0.75rem" }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "0.4rem 0.8rem", marginRight: "0.5rem" }}
                    onClick={() => openEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ padding: "0.4rem 0.8rem", background: "var(--error)", color: "white", border: "none", borderRadius: 6 }}
                    onClick={() => del(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}