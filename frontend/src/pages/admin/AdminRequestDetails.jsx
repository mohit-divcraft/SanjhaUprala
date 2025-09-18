// src/pages/admin/AdminRequestDetails.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function AdminRequestDetails() {
  const { id } = useParams()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('adminToken')

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }
    setLoading(true)
    fetch(`/api/api/admin/requests/${id}`, { headers: { Authorization: 'Bearer ' + token } })
      .then(async r => {
        if (r.status === 401) {
          localStorage.removeItem('adminToken')
          navigate('/admin/login', { replace: true })
          return null
        }
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then(data => {
        setRequest(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to load request')
        setLoading(false)
      })
  }, [id, navigate, token])

  async function handleAction(action) {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return
    try {
      const res = await fetch(`/api/api/admin/requests/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token }
      })
      if (res.status === 401) {
        localStorage.removeItem('adminToken')
        navigate('/admin/login', { replace: true })
        return
      }
      if (!res.ok) throw new Error('Action failed')
      const updated = await res.json()
      setRequest(updated)
      alert(`Request ${action}ed`)
      // optionally navigate back to list
      navigate('/admin/requests')
    } catch (err) {
      console.error(err)
      alert('Failed to perform action')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!request) return <div>Request not found</div>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">Request details</h1>

      <div className="mb-4 p-4 bg-white border rounded">
        <div className="mb-2"><strong>NGO:</strong> {request.ngo?.name || request.ngoName}</div>
        <div className="mb-2"><strong>NGO Type:</strong> {request.ngoType || request.ngo?.type || '—'}</div>
        <div className="mb-2"><strong>Contact Person:</strong> {request.contactPerson} ({request.designation || '—'})</div>
        <div className="mb-2"><strong>Contact Phone:</strong> {request.contactPhone}</div>
        <div className="mb-2"><strong>Village:</strong> {request.village?.name}</div>
        <div className="mb-2"><strong>Support Type:</strong> {request.supportType?.label}</div>
        <div className="mb-2"><strong>Scale:</strong> {request.scale?.label}</div>
        <div className="mb-2"><strong>Remarks:</strong> <div className="mt-1 p-2 bg-gray-50 border rounded">{request.remarks || '—'}</div></div>
        <div className="mb-2"><strong>Status:</strong> {request.status}</div>
        <div className="text-sm text-gray-500">Submitted: {new Date(request.createdAt).toLocaleString()}</div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => handleAction('approve')} className="px-4 py-2 bg-green-600 text-white rounded">Approve</button>
        <button onClick={() => handleAction('reject')} className="px-4 py-2 bg-red-600 text-white rounded">Reject</button>
        <button onClick={() => navigate('/admin/requests')} className="px-3 py-2 border rounded">Back to list</button>
      </div>
    </div>
  )
}
