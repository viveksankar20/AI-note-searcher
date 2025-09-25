import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost } from '../api'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await apiPost('/auth/register', { name, email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      setError('Could not register. Try a different email.')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-gray-900 text-white rounded py-2">Register</button>
      </form>
      <p className="text-sm text-gray-600 mt-4">Already have an account? <Link to="/login" className="underline">Login</Link></p>
    </div>
  )
}
