// src/pages/admin/AdminRequests.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function AdminRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('adminToken')

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }

    fetch('/api/api/admin/requests', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(async r => {
        if (r.status === 401) {
          localStorage.removeItem('adminToken')
          navigate('/admin/login', { replace: true })
          return []
        }
        if (!r.ok) throw new Error('Failed to load requests')
        return r.json()
      })
      .then(data => {
        setRequests(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to fetch requests')
        setLoading(false)
      })
  }, [navigate, token])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">NGO Requests</h1>
      {requests.length === 0 ? (
        <div>No requests found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">#</th>
                <th className="p-2 border">NGO</th>
                <th className="p-2 border">Village</th>
                <th className="p-2 border">Support Type</th>
                <th className="p-2 border">Scale</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, idx) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2 border align-top">{idx + 1}</td>
                  <td className="p-2 border align-top">{r.ngo?.name || r.ngoName}</td>
                  <td className="p-2 border align-top">{r.village?.name}</td>
                  <td className="p-2 border align-top">{r.supportType?.label}</td>
                  <td className="p-2 border align-top">{r.scale?.label}</td>
                  <td className="p-2 border align-top">{r.status}</td>
                  <td className="p-2 border align-top">
                    <Link
                      to={`/admin/requests/${r.id}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
