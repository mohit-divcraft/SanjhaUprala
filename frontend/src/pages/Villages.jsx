import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function VillageCard({ v }){
  // choose patwari if exists
  const patwari = v.contacts?.find(c => c.role === 'PATWARI')
  return (
    <Link to={`/villages/${v.id}`} className="block p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition">
      {/* <div className="h-36 bg-gray-100 rounded-md mb-3 flex items-center justify-center text-gray-400">
        <span className="uppercase text-sm">{v.name}</span>
      </div> */}
      <h3 className="text-lg font-semibold">{v.name}</h3>
      {/* <p className="text-sm text-gray-500 mt-1">{v.district ?? '—'}</p>
      <div className="mt-3 text-sm text-gray-600">
        {patwari ? <span>Patwari: {patwari.name} • {patwari.phone}</span> : <span>No primary contact</span>}
      </div> */}
    </Link>
  )
}

export default function Villages(){
  const [villages, setVillages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    setLoading(true)
    fetch('/api/api/villages')
      .then(r => r.json())
      .then(data => { setVillages(data); setLoading(false) })
      .catch(e => { console.error(e); setError('Failed to load'); setLoading(false) })
  },[])

  return (
    <div>
      
<div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Browse villages and see their needs and contacts</h2>
      </div>

      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {villages.map(v => <VillageCard key={v.id} v={v} />)}
      </div>
    </div>
  )
}
