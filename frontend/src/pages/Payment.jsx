import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useNotification } from '../context/NotificationContext'

export default function Payment() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { showNotification } = useNotification()

  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePayment = async (e) => {
    e.preventDefault()
    setLoading(true)
  
    try {
      const res = await api.post(`/payments/process`, {
        orderId: Number(orderId),
        cardNumber,
        expiry,
        cvv
      })
  
      if (res.data.status === "SUCCESS") {
        showNotification('Payment successful 🎉', 'success')
        navigate('/my-orders')
      } else {
        showNotification(res.data.message || 'Payment failed', 'error')
      }
  
    } catch (err) {
      showNotification('Payment failed', 'error')
    }
  
    setLoading(false)
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2>Secure Payment</h2>

        <form onSubmit={handlePayment} className="payment-form">

          <div className="form-group">
            <label>Account Holder Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <select required>
              <option value="">Select Account Type</option>
              <option>Savings</option>
              <option>Credit</option>
              <option>Debit</option>
            </select>
          </div>

          <div className="form-group">
            <label>Card Number</label>
            <input
              type="text"
              required
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
            />
          </div>

          <div className="form-group">
            <label>Expiry Date</label>
            <input
              type="text"
              required
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
            />
          </div>

          <div className="form-group">
            <label>CVV</label>
            <input
              type="password"
              required
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="123"
            />
          </div>

          <button type="submit" className="pay-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Pay Now'}
          </button>

        </form>
      </div>
    </div>
  )
}