import { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
    useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) navigate('/admin/requests', { replace: true })
    }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("/api/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      if (!res.ok) throw new Error("Login failed")
      const data = await res.json()
      localStorage.setItem("adminToken", data.token)
      navigate("/admin/requests")
    } catch (err) {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username"
          className="w-full border px-3 py-2 rounded" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"
          className="w-full border px-3 py-2 rounded" />
        {error && <p className="text-red-600">{error}</p>}
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
      </form>
    </div>
  )
}
