import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <nav className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-xl">AI Note Searcher</Link>
        <div className="space-x-4">
          {user ? (
            <>
              <span className="text-gray-600">Hi, {user.name}</span>
              <button onClick={() => { logout(); navigate('/login'); }} className="px-3 py-1 rounded bg-gray-900 text-white">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1 rounded bg-gray-900 text-white">Login</Link>
              <Link to="/register" className="px-3 py-1 rounded bg-gray-200">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function Root() {
  return (
    <AuthProvider>
      <Nav />
      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </main>
    </AuthProvider>
  )
}
