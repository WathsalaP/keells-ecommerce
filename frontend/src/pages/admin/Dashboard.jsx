import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data))
  }, [])

  if (!stats) return <div className="container"><p>Loading...</p></div>

  const cards = [
    { label: 'Monthly Revenue', value: `LKR ${stats.monthlyRevenue?.toFixed(2) || '0.00'}`, link: '/admin/orders' },
    { label: 'Yearly Revenue', value: `LKR ${stats.yearlyRevenue?.toFixed(2) || '0.00'}`, link: '/admin/orders' },
    { label: 'Monthly Orders', value: stats.monthlyOrderCount || 0, link: '/admin/orders' },
    { label: 'Yearly Orders', value: stats.yearlyOrderCount || 0, link: '/admin/orders' },
    { label: 'Total Users', value: stats.totalUsers || 0, link: '/admin/users' },
    { label: 'Total Products', value: stats.totalProducts || 0, link: '/admin/products' },
  ]

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(c => (
          <Link key={c.label} to={c.link} className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.label}</p>
            <h2 style={{ color: 'var(--keells-green)' }}>{c.value}</h2>
          </Link>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/admin/products" className="btn btn-primary">Manage Products</Link>
        <Link to="/admin/categories" className="btn btn-outline">Manage Categories</Link>
        <Link to="/admin/discounts" className="btn btn-outline">Manage Discounts</Link>
        <Link to="/admin/users" className="btn btn-outline">Manage Users</Link>
        <Link to="/admin/orders" className="btn btn-outline">View Orders</Link>
      </div>
    </div>
  )
}
