import { useEffect, useState } from "react";
import api from "../../api";

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);

  // editing: null=closed, 0=add new, >0=edit
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({ name: "", description: "", logoUrl: "" });

  const load = () => api.get("/admin/brands").then((r) => setBrands(r.data));

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(0);
    setForm({ name: "", description: "", logoUrl: "" });
  };

  const openEdit = (b) => {
    setEditing(b.id);
    setForm({
      name: b?.name || "",
      description: b?.description || "",
      logoUrl: b?.logoUrl || "",
    });
  };

  const closeForm = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing && editing !== 0) {
        await api.put(`/admin/brands/${editing}`, form);
      } else {
        await api.post("/admin/brands", form);
      }
      closeForm();
      load();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to save brand");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this brand?")) return;
    await api.delete(`/admin/brands/${id}`);
    load();
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: "1.5rem" }}>Manage Brands</h1>

      <button className="btn btn-primary" onClick={openAdd} style={{ marginBottom: "1rem" }}>
        + Add Brand
      </button>

      {editing !== null && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3>{editing && editing !== 0 ? "Edit" : "Add"} Brand</h3>

          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label>Logo URL (or /uploads/brands/xxx.png)</label>
                <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button type="button" className="btn btn-outline" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Logo</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Name</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Description</th>
              <th style={{ padding: "0.75rem" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {brands.map((b) => (
              <tr key={b.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.75rem" }}>
                  {b.logoUrl ? <img src={b.logoUrl} alt={b.name} style={{ width: 60, height: 60, objectFit: "contain" }} /> : "—"}
                </td>
                <td style={{ padding: "0.75rem" }}>{b.name}</td>
                <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>{b.description}</td>
                <td style={{ padding: "0.75rem" }}>
                  <button className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", marginRight: "0.5rem" }} onClick={() => openEdit(b)}>
                    Edit
                  </button>
                  <button
                    style={{ padding: "0.4rem 0.8rem", background: "var(--error)", color: "white", border: "none", borderRadius: 6 }}
                    onClick={() => del(b.id)}
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