// src/pages/admin/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

/**
 * Simple client-side protection:
 * - checks existence of token in localStorage
 * - optionally you can call an API to verify token validity (recommended)
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken')
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }
  // If you want to verify token validity on each load, you can fetch /api/admin/verify here.
  return children
}
