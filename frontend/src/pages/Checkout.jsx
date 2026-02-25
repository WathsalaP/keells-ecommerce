import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useNotification } from '../context/NotificationContext'

const STATUS_ORDER = ['READY', 'PICKUP', 'IN_DELIVERY', 'HAND_OVER']

export default function Checkout() {
  const [cart, setCart] = useState(null)
  const [locations, setLocations] = useState({ provinces: [], provinceDistricts: {} })
  const [form, setForm] = useState({ province: '', district: '', deliveryAddress: '', contactPhone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { showNotification } = useNotification()

  useEffect(() => {
    api.get('/user/cart').then((r) => setCart(r.data))
    api.get('/locations/all').then((r) => setLocations(r.data))
  }, [])

  const districts = form.province ? (locations.provinceDistricts?.[form.province] || []) : []

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value, ...(name === 'province' ? { district: '' } : {}) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/user/checkout', {
        province: form.province,
        district: form.district,
        deliveryAddress: form.deliveryAddress,
        contactPhone: form.contactPhone,
      })
      showNotification('Order placed successfully! 🎉', 'success')
      navigate(`/payment/${data.id}`)
    } catch (err) {
      const msg = err.response?.data?.error || 'Checkout failed'
      setError(msg)
      showNotification(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="container">
        <p>Cart is empty. <a href="/products">Browse products</a></p>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Delivery Details</h3>
          <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Country: Sri Lanka (fixed)</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Province</label>
              <select name="province" value={form.province} onChange={handleChange} required>
                <option value="">Select Province</option>
                {(locations.provinces || []).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>District (City)</label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                required
                disabled={!form.province}
              >
                <option value="">Select District</option>
                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Street Address</label>
              <textarea
                name="deliveryAddress"
                value={form.deliveryAddress}
                onChange={handleChange}
                required
                rows={3}
                placeholder="House no, street, area"
              />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
                required
                placeholder="07XXXXXXXX"
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Processing...' : 'Pay & Place Order (Free Payment)'}
            </button>
          </form>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Order Summary</h3>
          {cart.items?.map((i) => (
            <div
              key={i.id}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}
            >
              <span>{i.productName} x {i.quantity}</span>
              <span>LKR {i.totalPrice?.toFixed(2)}</span>
            </div>
          ))}
          <hr style={{ margin: '1rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem' }}>
            <span>Total</span>
            <span>LKR {cart.totalAmount?.toFixed(2)}</span>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Payment: Free demo gateway - order will be confirmed automatically.
          </p>
        </div>
      </div>
    </div>
  )
}