import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, isAdmin } = useAuth()
  return (
    <div className="container">
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--keells-green)' }}>
          Welcome to Keells Delivery
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 600, margin: '0 auto 2rem' }}>
          Shop groceries and essentials from Keells - delivered to your doorstep across Sri Lanka.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
          {!user && <Link to="/register" className="btn btn-outline">Create Account</Link>}
          {isAdmin && user && <Link to="/admin" className="btn btn-outline">Admin Dashboard</Link>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
          <h3>Wide Selection</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Groceries, dairy, beverages & more</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚚</div>
          <h3>Island-wide Delivery</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track your order in real-time</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💰</div>
          <h3>Best Prices</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Exclusive discounts & offers</p>
        </div>
      </div>
    </div>
  )
}
