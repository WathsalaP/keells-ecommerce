import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/user/orders').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container"><p>Loading...</p></div>

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>My Orders</h1>
      {orders.length === 0 ? (
        <div className="card">
          <p>No orders yet. <Link to="/products">Start shopping</Link></p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(o => (
            <Link key={o.id} to={`/orders/${o.orderNumber}`} className="card" style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <strong>{o.orderNumber}</strong>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(o.orderDate).toLocaleString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'var(--keells-green)', color: 'white', borderRadius: 6, fontSize: '0.85rem' }}>
                    {o.status?.replace('_', ' ')}
                  </span>
                  <p style={{ marginTop: '0.25rem', fontWeight: 600 }}>LKR {o.totalAmount?.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
