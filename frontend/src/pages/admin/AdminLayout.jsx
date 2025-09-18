// src/pages/admin/AdminLayout.jsx
import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function AdminLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('adminToken')
    // optional: remove other admin-related storage
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold">SANJHA UPRALA — Admin</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-3 py-1 rounded bg-gray-700/60 hover:bg-gray-700"
            >
              Public
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
