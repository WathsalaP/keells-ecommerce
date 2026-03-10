import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../api'
import AIAssistantModal from './AIAssistantModal'
import './ai/ai.css'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [aiOpen, setAiOpen] = useState(false)

  const fetchCartCount = () => {
    if (user && !isAdmin) {
      api.get('/user/cart')
        .then(r => setCartCount(r.data?.totalItems || 0))
        .catch(() => setCartCount(0))
    } else {
      setCartCount(0)
    }
  }

  useEffect(() => {
    fetchCartCount()
  }, [user, isAdmin])

  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner" style={{ position: 'relative' }}>
          <Link to="/" className="logo">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span aria-hidden="true">🛒</span>
              <span>Keells Delivery</span>
            </span>
          </Link>

          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/products">Shop</Link>

            {user ? (
              <>
                {!isAdmin && (
                  <>
                    <Link to="/cart" className="cart-badge">
                      Cart {cartCount > 0 && <span>{cartCount}</span>}
                    </Link>
                    <Link to="/orders">My Orders</Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link to="/admin">Dashboard</Link>
                    <Link to="/admin/products">Manage Products</Link>
                    <Link to="/admin/brands">Brands</Link>
                    <Link to="/admin/orders">Orders</Link>
                    <Link to="/admin/users">Users</Link>
                  </>
                )}

                <button onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Sign Up</Link>
              </>
            )}
          </nav>

          {user && !isAdmin && (
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="ai-fab"
              title="Keells AI Assistant"
              aria-label="Open Keells AI Assistant"
            >
              <span className="ai-fab-spark" aria-hidden="true">✦</span>
              <span className="ai-fab-text">AI</span>
            </button>
          )}
        </div>
      </header>

      <main className="main">
        <Outlet context={{ fetchCartCount }} />
      </main>

      {user && !isAdmin && (
        <AIAssistantModal
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          userFullName={user?.fullName || 'there'}
        />
      )}
    </div>
  )
}