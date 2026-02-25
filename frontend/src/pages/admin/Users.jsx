import { useState, useEffect } from 'react'
import api from '../../api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data))
  }, [])

  const toggleActive = (id) => {
    api.put(`/admin/users/${id}/toggle-active`).then(r => {
      setUsers(prev => prev.map(u => u.id === id ? r.data : u))
    })
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Manage Users</h1>
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Status</th>
              <th style={{ padding: '0.75rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem' }}>{u.fullName}</td>
                <td style={{ padding: '0.75rem' }}>{u.email}</td>
                <td style={{ padding: '0.75rem' }}>{u.role}</td>
                <td style={{ padding: '0.75rem' }}>{u.active ? 'Active' : 'Disabled'}</td>
                <td style={{ padding: '0.75rem' }}>
                  {u.role !== 'ADMIN' && (
                    <button
                      className={`btn ${u.active ? 'btn-outline' : 'btn-primary'}`}
                      style={{ padding: '0.4rem 0.8rem' }}
                      onClick={() => toggleActive(u.id)}
                    >
                      {u.active ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
