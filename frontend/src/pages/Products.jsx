import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { useNotification } from '../context/NotificationContext'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const { user, isAdmin } = useAuth()
  const { showNotification } = useNotification()

  useEffect(() => {
    api.get('/public/categories').then((r) => setCategories(r.data))
  }, [])

  useEffect(() => {
    if (selectedCat) {
      api.get(`/public/products/category/${selectedCat}`).then((r) => setProducts(r.data))
    } else {
      api.get('/public/products').then((r) => setProducts(r.data))
    }
  }, [selectedCat])

  const addToCart = async (productId) => {
    if (!user || isAdmin) return
    try {
      await api.post(`/user/cart/add/${productId}?quantity=1`)
      showNotification('Product added to cart!', 'success')
    } catch (e) {
      showNotification(e.response?.data?.error || 'Failed to add product', 'error')
    }
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1rem' }}>Products</h1>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          className={`btn ${!selectedCat ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSelectedCat(null)}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`btn ${selectedCat === c.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCat(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <div className="product-image">
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <span>🛒</span>}
            </div>
            <div className="product-info">
              <h3>{p.name}</h3>
              {p.discountPercentage > 0 && (
                <span className="discount-badge">{p.discountPercentage}% OFF</span>
              )}
              <div>
                <span className="price">LKR {p.discountedPrice?.toFixed(2) || p.price?.toFixed(2)}</span>
                {p.discountedPrice && p.discountedPrice < p.price && (
                  <span className="original-price">LKR {p.price?.toFixed(2)}</span>
                )}
              </div>
              {!isAdmin && user && (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.75rem' }}
                  onClick={() => addToCart(p.id)}
                  disabled={!p.stockQuantity}
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}