import { useEffect, useState } from "react";
import api from "../../api";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);

  // ✅ editing: null = closed, 0 = add new, >0 = edit existing
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });

  const load = async () => {
    try {
      const r = await api.get("/admin/categories");
      setCategories(r.data || []);
    } catch (e) {
      alert(e.response?.data?.error || "Failed to load categories");
      setCategories([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ THIS is the main fix: openAdd must set editing = 0 (NOT null)
  const openAdd = () => {
    setEditing(0);
    setForm({ name: "", description: "", imageUrl: "" });
  };

  const openEdit = (c) => {
    setEditing(c.id);
    setForm({
      name: c?.name || "",
      description: c?.description || "",
      imageUrl: c?.imageUrl || "",
    });
  };

  const closeForm = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name?.trim(),
      description: form.description || "",
      imageUrl: form.imageUrl || "",
    };

    try {
      if (editing && editing !== 0) {
        await api.put(`/admin/categories/${editing}`, payload);
      } else {
        await api.post("/admin/categories", payload);
      }
      closeForm();
      await load();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to save category");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete category");
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: "1.5rem" }}>Manage Categories</h1>

      <button className="btn btn-primary" onClick={openAdd} style={{ marginBottom: "1rem" }}>
        + Add Category
      </button>

      {editing !== null && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3>{editing && editing !== 0 ? "Edit" : "Add"} Category</h3>

          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category Image URL (or /uploads/categories/xxx.png)</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
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
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Image</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Name</th>
              <th style={{ textAlign: "left", padding: "0.75rem" }}>Description</th>
              <th style={{ padding: "0.75rem" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.75rem" }}>
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      style={{ width: 70, height: 50, objectFit: "cover", borderRadius: 10 }}
                    />
                  ) : "—"}
                </td>
                <td style={{ padding: "0.75rem" }}>{c.name}</td>
                <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>{c.description}</td>
                <td style={{ padding: "0.75rem" }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "0.4rem 0.8rem", marginRight: "0.5rem" }}
                    onClick={() => openEdit(c)}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      padding: "0.4rem 0.8rem",
                      background: "var(--error)",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                    }}
                    onClick={() => del(c.id)}
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