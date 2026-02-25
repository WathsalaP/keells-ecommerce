import { useState, useEffect } from 'react'
import api from '../../api'

export default function AdminCategories() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ name: '', description: '' })
  const [editing, setEditing] = useState(null)

  const load = () => api.get('/admin/categories').then(r => setList(r.data))
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e?.preventDefault()
    try {
      if (editing) await api.put(`/admin/categories/${editing}`, form)
      else await api.post('/admin/categories', form)
      setForm({ name: '', description: '' })
      setEditing(null)
      load()
    } catch (err) { alert(err.response?.data?.error || 'Failed') }
  }

  const del = (id) => { if (confirm('Delete?')) api.delete(`/admin/categories/${id}`).then(load) }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Manage Categories</h1>
      <form onSubmit={save} className="card" style={{ marginBottom: '1.5rem', maxWidth: 400 }}>
        <h3>{editing ? 'Edit' : 'Add'} Category</h3>
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
        {editing && <button type="button" className="btn btn-outline" style={{ marginLeft: '0.5rem' }} onClick={() => { setEditing(null); setForm({ name: '', description: '' }) }}>Cancel</button>}
      </form>
      <div className="card">
        {list.map(c => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <div><strong>{c.name}</strong><p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{c.description}</p></div>
            <div>
              <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', marginRight: '0.5rem' }} onClick={() => { setEditing(c.id); setForm({ name: c.name, description: c.description || '' }) }}>Edit</button>
              <button style={{ padding: '0.4rem 0.8rem', background: 'var(--error)', color: 'white', border: 'none', borderRadius: 6 }} onClick={() => del(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
