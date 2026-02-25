import { useState, useEffect } from 'react'
import api from '../../api'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    api.get('/admin/orders').then(r => setOrders(r.data))
  }, [])

  const updateStatus = (orderId, status, description) => {
    api.put(`/admin/orders/${orderId}/status`, { status, description }).then(r => {
      setOrders(prev => prev.map(o => o.id === orderId ? r.data : o))
    })
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Orders Management</h1>
      <div className="card">
        {orders.map(o => (
          <div key={o.id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong>{o.orderNumber}</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>LKR {o.totalAmount?.toFixed(2)} • {o.orderDate && new Date(o.orderDate).toLocaleString()}</p>
                <p style={{ fontSize: '0.85rem' }}>{o.deliveryAddress}</p>
              </div>
              <div>
                <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'var(--keells-green)', color: 'white', borderRadius: 6, marginBottom: '0.5rem' }}>{o.status?.replace('_', ' ')}</span>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {['READY', 'PICKUP', 'IN_DELIVERY', 'HAND_OVER'].map(s => (
                    <button
                      key={s}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                      onClick={() => updateStatus(o.id, s)}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
