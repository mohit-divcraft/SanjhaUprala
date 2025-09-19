import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Requirements(){
  const [villages, setVillages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  return (
    <div>
      
<div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Medical relief Requirements</h2>
      </div>

      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
       
      </div>
    </div>
  )
}
