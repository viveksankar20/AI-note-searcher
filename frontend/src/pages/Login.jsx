import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
const { login } = useAuth()
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await apiPost('/auth/login', { email, password })
    
      login(data.token, data.user)
  navigate('/dashboard', { replace: true })
      console.log("logined")
    } catch (err) {
      setError('Invalid credentials or server error')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-gray-900 text-white rounded py-2">Sign In</button>
      </form>
      <p className="text-sm text-gray-600 mt-4">No account? <Link to="/register" className="underline">Register</Link></p>
    </div>
  )
}
