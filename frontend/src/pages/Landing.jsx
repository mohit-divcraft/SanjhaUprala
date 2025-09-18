import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function VillageCard({ v }){
  // choose patwari if exists
  const patwari = v.contacts?.find(c => c.role === 'PATWARI')
  return (
    <Link to={`/villages/${v.id}`} className="block p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition">
      <div className="h-36 bg-gray-100 rounded-md mb-3 flex items-center justify-center text-gray-400">
        {/* placeholder image area */}
        <span className="uppercase text-sm">{v.name}</span>
      </div>
      <h3 className="text-lg font-semibold">{v.name}</h3>
      {/* <p className="text-sm text-gray-500 mt-1">{v.district ?? '—'}</p>
      <div className="mt-3 text-sm text-gray-600">
        {patwari ? <span>Patwari: {patwari.name} • {patwari.phone}</span> : <span>No primary contact</span>}
      </div> */}
    </Link>
  )
}

export default function Landing(){
  const [villages, setVillages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    setLoading(true)
    fetch('/api/villages')
      .then(r => r.json())
      .then(data => { setVillages(data); setLoading(false) })
      .catch(e => { console.error(e); setError('Failed to load'); setLoading(false) })
  },[])

  return (
    <div>
      
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
  <h2 className="text-2xl font-bold text-blue-900 mb-3">
    Saanjha Uprala – Rebuilding Together
  </h2>
  <p className="text-gray-700 leading-relaxed">
    The recent floods have significantly impacted several villages in our district,
    causing extensive damage to homes, infrastructure, and livelihoods.
    In this time of need, the District Administration of Amritsar is launching an
    initiative, <span className="font-semibold">Saanjha Uprala</span>, to facilitate
    the adoption of these affected villages by interested organisations, NGOs,
    corporations, and individuals.
  </p>
  <p className="text-gray-700 leading-relaxed mt-3">
    This initiative is a critical step towards expediting the recovery and
    rehabilitation process. By adopting a village, you will play a direct role in
    providing essential support for reconstruction, restoring basic services, and
    helping residents rebuild their lives.
  </p>
</div>
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
