import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

export default function Requirements() {
  const [houseDamageRequirements, setHouseDamageRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // filter state
  const [damageFilter, setDamageFilter] = useState('ALL')
  const [villageFilter, setVillageFilter] = useState('ALL')

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch('/api//api/houseDamageRequirments')   // ✅ corrected path
      .then(r => {
        if (!r.ok) throw new Error('Network error')
        return r.json()
      })
      .then(data => {
        setHouseDamageRequirements(data || [])
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setError('Failed to load')
        setLoading(false)
      })
  }, [])

  // derive filter options
  const damageTypes = useMemo(() => {
    const types = Array.from(new Set(houseDamageRequirements.map(r => r.surveyType).filter(Boolean)))
    return ['ALL', ...types]
  }, [houseDamageRequirements])

  const villages = useMemo(() => {
    const vils = Array.from(new Set(houseDamageRequirements.map(r => r.village).filter(Boolean)))
    vils.sort()
    return ['ALL', ...vils]
  }, [houseDamageRequirements])

  // apply filters
  const filtered = useMemo(() => {
    return houseDamageRequirements.filter(r => {
      if (damageFilter !== 'ALL' && r.surveyType !== damageFilter) return false
      if (villageFilter !== 'ALL' && r.village !== villageFilter) return false
      return true
    })
  }, [houseDamageRequirements, damageFilter, villageFilter])

  return (
    <div className="pb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Damaged Houses</h2>
        <p className="text-gray-600 text-sm">List of applicants with damaged houses (from survey records)</p>
      </div>

      {/* Filter controls */}
      <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Damage Type</label>
            <select
              value={damageFilter}
              onChange={e => setDamageFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              {damageTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
            <select
              value={villageFilter}
              onChange={e => setVillageFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              {villages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> of{' '}
          <span className="font-semibold">{houseDamageRequirements.length}</span> records
        </div>
      </div>

      {loading && <div className="text-gray-500">Loading…</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6 text-gray-600 text-center">No records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-600 w-36">Damage Type</th>
                    <th className="px-3 py-2 text-left text-gray-600 w-36">Claim ID</th>
                    <th className="px-3 py-2 text-left text-gray-600 w-60">Claimant</th>
                    <th className="px-3 py-2 text-left text-gray-600">Father/Husband</th>
                    <th className="px-3 py-2 text-left text-gray-600 w-36">Mobile</th>
                    <th className="px-3 py-2 text-left text-gray-600 w-28">Village</th>
                    <th className="px-3 py-2 text-left text-gray-600 w-28">Tehsil</th>
                    <th className="px-3 py-2 text-left text-gray-600 w-28">District</th>
                    <th className="px-3 py-2 text-left text-gray-600">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="even:bg-white odd:bg-gray-50">
                      <td className="px-3 py-2 font-mono">{r.surveyType}</td>
                      <td className="px-3 py-2 font-mono">{r.claimID}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">
                        <div>{r.claimantName}</div>
                        <div className="text-xs text-gray-500">
                          {r.gender || '—'} {r.age ? `· ${r.age} yrs` : ''}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-700">{r.fatherName}</td>
                      <td className="px-3 py-2">
                        {r.mobileNumber ? (
                          <a href={`tel:${r.mobileNumber}`} className="text-emerald-600 hover:underline">
                            {r.mobileNumber}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2">{r.village}</td>
                      <td className="px-3 py-2">{r.tehsil}</td>
                      <td className="px-3 py-2">{r.district}</td>
                      <td className="px-3 py-2">{r.fullAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
