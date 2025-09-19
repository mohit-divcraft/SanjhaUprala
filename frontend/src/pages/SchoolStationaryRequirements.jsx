import React, { useEffect, useMemo, useState } from 'react'

export default function Requirements() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // frontend filters
  const [blockFilter, setBlockFilter] = useState('ALL')
  const [q, setQ] = useState('')

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch('/api/api/schoolStationeryRequirements')
      .then(r => {
        if (!r.ok) throw new Error('Network response not ok')
        return r.json()
      })
      .then(data => {
        setRows(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to load data')
        setLoading(false)
      })
  }, [])

  // compute block options from data
  const blocks = useMemo(() => {
    const setBlocks = new Set(rows.map(r => (r.blockName || '').trim()).filter(Boolean))
    const arr = Array.from(setBlocks).sort((a, b) => a.localeCompare(b))
    return ['ALL', ...arr]
  }, [rows])

  // filtered rows
  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (blockFilter !== 'ALL' && (r.blockName || '') !== blockFilter) return false
      if (q.trim()) {
        const needle = q.trim().toLowerCase()
        const school = (r.schoolName || '').toLowerCase()
        const notes = (r.notes || '').toLowerCase()
        if (!school.includes(needle) && !notes.includes(needle)) return false
      }
      return true
    })
  }, [rows, blockFilter, q])

  return (
    <div className="pb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">School Stationery Requirements</h2>
        <p className="text-gray-600 text-sm">List of schools requesting stationery/uniform items. Use the filters to narrow results.</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Block</label>
            <select
              value={blockFilter}
              onChange={e => setBlockFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              {blocks.map(b => (
                <option key={b} value={b}>{b === 'ALL' ? 'All blocks' : b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">School Name</label>
            <input
              type="search"
              placeholder="school name"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-64"
            />
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> of <span className="font-semibold">{rows.length}</span> records
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
          <th className="px-3 py-2 text-left text-gray-600 w-40">Block</th>
          <th className="px-3 py-2 text-left text-gray-600 w-40">School Name</th>
          <th className="px-3 py-2 text-right text-gray-600 w-40">Student Strength</th>
          <th className="px-3 py-2 text-right text-gray-600">
            Requirement of Stationery/Uniform <br />
            <span className="text-xs font-normal text-gray-500">
              (Bag ×1, Copy SL ×6, Math Copy ×3, Four Line ×3, Pencil Box ×1, Sharpener, Eraser, Colours)
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        {filtered.map((r, idx) => (
          <tr key={r.id ?? idx} className="even:bg-white odd:bg-gray-50">
            <td className="px-3 py-2 text-gray-800">{r.blockName}</td>
            <td className="px-3 py-2 font-medium text-gray-800">{r.schoolName}</td>
            <td className="px-3 py-2 text-right text-gray-700">{r.studentStrength ?? '—'}</td>
            <td className="px-3 py-2 text-right text-gray-700">{r.requirementCount ?? '—'}</td>
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
