import { useState, useEffect } from 'react'
import api from '../../api'

export default function AdminDiscounts() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ name: '', percentage: '' })
  const [editing, setEditing] = useState(null)

  const load = () => api.get('/admin/discounts').then(r => setList(r.data))
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e?.preventDefault()
    try {
      const payload = { ...form, percentage: parseFloat(form.percentage) }
      if (editing) await api.put(`/admin/discounts/${editing}`, payload)
      else await api.post('/admin/discounts', payload)
      setForm({ name: '', percentage: '' })
      setEditing(null)
      load()
    } catch (err) { alert(err.response?.data?.error || 'Failed') }
  }

  const del = (id) => { if (confirm('Delete?')) api.delete(`/admin/discounts/${id}`).then(load) }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Manage Discounts</h1>
      <form onSubmit={save} className="card" style={{ marginBottom: '1.5rem', maxWidth: 400 }}>
        <h3>{editing ? 'Edit' : 'Add'} Discount</h3>
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Percentage</label>
          <input type="number" step="0.01" min="0" max="100" value={form.percentage} onChange={e => setForm({...form, percentage: e.target.value})} required />
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
        {editing && <button type="button" className="btn btn-outline" style={{ marginLeft: '0.5rem' }} onClick={() => { setEditing(null); setForm({ name: '', percentage: '' }) }}>Cancel</button>}
      </form>
      <div className="card">
        {list.map(d => (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <div><strong>{d.name}</strong> - {d.percentage}%</div>
            <div>
              <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', marginRight: '0.5rem' }} onClick={() => { setEditing(d.id); setForm({ name: d.name, percentage: String(d.percentage || '') }) }}>Edit</button>
              <button style={{ padding: '0.4rem 0.8rem', background: 'var(--error)', color: 'white', border: 'none', borderRadius: 6 }} onClick={() => del(d.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
