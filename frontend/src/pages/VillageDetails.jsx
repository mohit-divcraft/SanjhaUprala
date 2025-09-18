// src/pages/VillageDetails.jsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function VillageDetails(){
  const { id } = useParams()
  const [village, setVillage] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loadingVillage, setLoadingVillage] = useState(true)
  const [loadingAssignments, setLoadingAssignments] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    setLoadingVillage(true)
    fetch('/api/api/villages')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load villages')
        return r.json()
      })
      .then(list => {
        const v = list.find(x => x.id === id)
        setVillage(v || null)
        setLoadingVillage(false)
      })
      .catch((e)=>{
        console.error(e)
        setError('Failed to load village')
        setLoadingVillage(false)
      })
  },[id])

  useEffect(() => {
    setLoadingAssignments(true)
    fetch(`/api/api/villages/${id}/assignments`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load assignments')
        return r.json()
      })
      .then(list => {
        setAssignments(list || [])
        setLoadingAssignments(false)
      })
      .catch((e) => {
        console.warn('Could not fetch assignments:', e.message)
        // keep assignments empty but don't block the page
        setAssignments([])
        setLoadingAssignments(false)
      })
  }, [id])

  if (loadingVillage) return <div>Loading village...</div>
  if (!village) return <div>Village not found</div>

  const patwari = village.contacts?.find(c=>c.role==='PATWARI') ?? null
  const sarpanch = village.contacts?.find(c=>c.role==='SARPANCH') ?? null
  const numberdar = village.contacts?.find(c=>c.role==='NUMBERDAR') ?? null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">{village.name}</h2>
        {/* <p className="text-sm text-gray-600">District: {village.district ?? '—'}</p> */}
        {village.description && <p className="mt-2 text-gray-700">{village.description}</p>}
      </div>

      <section className="bg-white p-4 rounded shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Contacts</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {patwari && <li><strong>Patwari:</strong> {patwari.name}{patwari.phone ? ` — ${patwari.phone}` : ''}</li>}
          {sarpanch && <li><strong>Sarpanch:</strong> {sarpanch.name}{sarpanch.phone ? ` — ${sarpanch.phone}` : ''}</li>}
          {numberdar && <li><strong>Numberdar:</strong> {numberdar.name}{numberdar.phone ? ` — ${numberdar.phone}` : ''}</li>}
          {!patwari && !sarpanch && !numberdar && <li className="text-gray-500">No primary contacts available.</li>}
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-3">NGOs working in village</h3>

        {loadingAssignments ? (
          <div className="text-gray-500">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="text-gray-500">No NGOs working in this village.</div>
        ) : (
          <div className="space-y-4">
            {assignments.map(a => {
              // Many backends return nested objects (a.ngo, a.supportType, a.scale).
              // If nested objects are missing, fall back to showing the scalar id.
              const ngoName = a.ngo?.name || a.ngoName || '—'
              const ngoType = a.ngo?.type || a.ngoType || '—'
              const contact = a.contactPerson || '—'
              const designation = a.designation || '—'
              const phone = a.contactPhone || '—'
              const supportLabel = a.supportType?.label || a.supportType?.key || a.supportTypeId || '—'
              const scaleLabel = a.scale?.label || a.scale?.key || a.scaleId || '—'
              const remarks = a.remarks || '—'
              const created = a.createdAt ? new Date(a.createdAt).toLocaleString() : ''

              return (
                <article key={a.id} className="bg-white p-4 rounded border shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">{ngoName}</h4>
                      <div className="text-sm text-gray-600">{ngoType}</div>
                    </div>
                    <div className="text-sm text-gray-500">{created}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                    <div>
                      <div className="text-xs text-gray-500">Primary contact</div>
                      <div className="mt-1"><strong>{contact}</strong> {designation !== '—' && <span className="text-gray-600">— {designation}</span>}</div>
                      <div className="text-gray-600 mt-1">{phone}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Support & scale</div>
                      <div className="mt-1"><strong>{supportLabel}</strong></div>
                      <div className="text-gray-600 mt-1">{scaleLabel}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-gray-500">Remarks</div>
                    <div className="mt-1 p-3 bg-gray-50 border rounded text-sm text-gray-700">{remarks}</div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="bg-white p-4 rounded shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Requirements</h3>
        <p className="text-gray-500"></p>
      </section>

    </div>
  )
}
