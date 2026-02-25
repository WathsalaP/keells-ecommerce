import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminCategories from './pages/admin/Categories'
import AdminDiscounts from './pages/admin/Discounts'
import AdminUsers from './pages/admin/Users'
import AdminOrders from './pages/admin/Orders'
import Payment from './pages/Payment'


function ProtectedRoute({ children, adminOnly }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="auth-page"><div>Loading...</div></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route path="/payment/:orderId" element={
          <Payment />
        } />
        <Route path="cart" element={
          <ProtectedRoute><Cart /></ProtectedRoute>
        } />
        <Route path="checkout" element={
          <ProtectedRoute><Checkout /></ProtectedRoute>
        } />
        <Route path="orders" element={
          <ProtectedRoute><Orders /></ProtectedRoute>
        } />
        <Route path="orders/:orderNumber" element={
          <ProtectedRoute><OrderDetail /></ProtectedRoute>
        } />

        <Route path="admin" element={
          <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="admin/products" element={
          <ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>
        } />
        <Route path="admin/categories" element={
          <ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>
        } />
        <Route path="admin/discounts" element={
          <ProtectedRoute adminOnly><AdminDiscounts /></ProtectedRoute>
        } />
        <Route path="admin/users" element={
          <ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>
        } />
        <Route path="admin/orders" element={
          <ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
