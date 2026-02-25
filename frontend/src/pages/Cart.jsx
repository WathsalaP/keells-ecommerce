import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useNotification } from '../context/NotificationContext'

export default function Cart() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  const load = () =>
    api
      .get('/user/cart')
      .then((r) => {
        setCart(r.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const updateQty = (cartItemId, quantity) => {
    if (quantity < 1) return
    api
      .put(`/user/cart/update/${cartItemId}?quantity=${quantity}`)
      .then((r) => {
        setCart(r.data)
        showNotification('Cart updated successfully', 'success')
      })
      .catch(() => showNotification('Failed to update cart', 'error'))
  }

  const remove = (cartItemId) => {
    api
      .delete(`/user/cart/remove/${cartItemId}`)
      .then((r) => {
        setCart(r.data)
        showNotification('Item removed from cart', 'success')
      })
      .catch(() => showNotification('Failed to remove item', 'error'))
  }

  if (loading)
    return (
      <div className="container">
        <p>Loading cart...</p>
      </div>
    )

  if (!cart || cart.items.length === 0) {
    return (
      <div
        className="container"
        style={{ textAlign: 'center', padding: '3rem' }}
      >
        <h2>Your cart is empty</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Shopping Cart</h1>
      <div className="card">
        {cart.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              style={{ width: 60, height: 60, background: 'var(--keells-cream)', borderRadius: 8 }}
            />
            <div style={{ flex: 1 }}>
              <strong>{item.productName}</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                LKR {item.unitPrice?.toFixed(2)} each
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => updateQty(item.id, item.quantity - 1)}
                style={{ padding: '0.25rem 0.5rem' }}
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => updateQty(item.id, item.quantity + 1)}
                style={{ padding: '0.25rem 0.5rem' }}
              >
                +
              </button>
            </div>
            <strong>LKR {item.totalPrice?.toFixed(2)}</strong>
            <button
              onClick={() => remove(item.id)}
              style={{ color: 'var(--error)', background: 'none' }}
            >
              Remove
            </button>
          </div>
        ))}
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <h2>Total: LKR {cart.totalAmount?.toFixed(2)}</h2>
          <Link to="/checkout" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}