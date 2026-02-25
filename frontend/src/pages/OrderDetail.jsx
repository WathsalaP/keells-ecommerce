import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

const STATUS_LABELS = { READY: 'Order Ready', PICKUP: 'Picked Up', IN_DELIVERY: 'In Delivery', HAND_OVER: 'Delivered' }

export default function OrderDetail() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/user/orders/${orderNumber}`).then(r => setOrder(r.data)).catch(() => setOrder(null)).finally(() => setLoading(false))
  }, [orderNumber])

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!order) return <div className="container"><p>Order not found. <Link to="/orders">Back to orders</Link></p></div>

  const statusOrder = ['READY', 'PICKUP', 'IN_DELIVERY', 'HAND_OVER']
  const currentIdx = statusOrder.indexOf(order.status)

  return (
    <div className="container">
      <Link to="/orders" style={{ display: 'inline-block', marginBottom: '1rem' }}>← Back to Orders</Link>
      <h1 style={{ marginBottom: '0.5rem' }}>Order {order.orderNumber}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Placed on {new Date(order.orderDate).toLocaleString()}</p>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Tracking Status</h3>
        <div className="tracking-timeline">
          {statusOrder.map((s, i) => (
            <div key={s} className={`tracking-item ${i <= currentIdx ? 'completed' : ''}`}>
              <h4>{STATUS_LABELS[s]}</h4>
              {order.trackingHistory?.find(t => t.status === s) && (
                <p>{order.trackingHistory.find(t => t.status === s).description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Delivery Address</h3>
        <p>{order.deliveryAddress}</p>
        <p>Phone: {order.contactPhone}</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Items</h3>
        {order.items?.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
            <span>{item.productName} x {item.quantity}</span>
            <span>LKR {item.totalPrice?.toFixed(2)}</span>
          </div>
        ))}
        <div style={{ marginTop: '1rem', textAlign: 'right', fontWeight: 700, fontSize: '1.2rem' }}>
          Total: LKR {order.totalAmount?.toFixed(2)}
        </div>
      </div>
    </div>
  )
}
