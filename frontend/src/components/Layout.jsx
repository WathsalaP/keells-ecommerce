import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../api'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const fetchCartCount = () => {
    if (user && !isAdmin) {
      api.get('/user/cart').then(r => setCartCount(r.data?.totalItems || 0)).catch(() => setCartCount(0))
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
        <div className="header-inner">
          <Link to="/" className="logo">Keells Delivery</Link>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
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
                    <Link to="/admin/products">Products</Link>
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
        </div>
      </header>
      <main className="main">
        <Outlet context={{ fetchCartCount }} />
      </main>
    </div>
  )
}
