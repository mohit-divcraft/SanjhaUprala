import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

function ContactCell({ contacts = [], role }) {
  const c = contacts?.find(x => x.role === role)
  if (!c) return <span className="text-sm text-gray-500">—</span>
  return (
    <div className="text-sm">
      <div className="font-medium text-gray-800">{c.name}</div>
      <div className="text-xs text-gray-500">{c.phone ?? '—'}</div>
    </div>
  )
}

const CONTACTS = [
  {
    officer: "Smt. Sakshi Sawhney",
    designation: "Deputy Commissioner",
    department: "Revenue",
    mobile: "81302-56305",
    block: ""
  },
  {
    officer: "Sh. Rohit Gupta",
    designation: "Additional Deputy Commissioner (G)",
    department: "Revenue",
    mobile: "98150-08658",
    block: ""
  },
  {
    officer: "Smt. Amandeep Kaur",
    designation: "Additional Deputy Commissioner (Urban Development)",
    department: "Local Government",
    mobile: "84376-66205",
    block: ""
  },
  {
    officer: "SMT. PARAMJIT KAUR",
    designation: "ADC RURAL DEVELOPMENT",
    department: "Rural Development & Panchayats",
    mobile: "98151-52960",
    block: ""
  },
  {
    officer: "SH. RAVINDER SINGH",
    designation: "SDM AJNALA/RAMDAS",
    department: "Revenue",
    mobile: "98722-64640",
    block: "Nodal Officer"
  },
  {
    officer: "SH. SANJIV SHARMA",
    designation: "SDM LOPOKE (RAJASANSI)",
    department: "Revenue",
    mobile: "95305-76394",
    block: "Nodal Officer"
  },
  {
    officer: "SH. AMANPREET SINGH",
    designation: "SDM BABA BAKALA SAHIB",
    department: "Revenue",
    mobile: "95600-14061",
    block: "Nodal Officer"
  },
  {
    officer: "SH. KAWALJIT SINGH",
    designation: "DEO ELEMENTARY",
    department: "Education",
    mobile: "84270-04070",
    block: ""
  },
  {
    officer: "SH. RAJESH KUMAR",
    designation: "DEO SECONDARY",
    department: "Education",
    mobile: "84275-35700",
    block: ""
  },
  {
    officer: "SH. NAVRAJ SINGH",
    designation: "DY DIRECTOR ANIMAL HUSBANDRY",
    department: "Animal Husbandry",
    mobile: "81465-24999",
    block: ""
  },
  {
    officer: "SH. VARYAM SINGH",
    designation: "DY DIRECTOR DAIRY",
    department: "Dairy",
    mobile: "98159-82593",
    block: ""
  },
  {
    officer: "SH. SANDEEP MALHOTRA",
    designation: "DISTRICT DEVELOPMENT AND PANCHAYAT OFFICER",
    department: "Rural Development & Panchayats",
    mobile: "95010-49300",
    block: ""
  },
  {
    officer: "SH. BALJINDER SINGH",
    designation: "CHIEF AGRICULTURE OFFICER",
    department: "Agriculture",
    mobile: "77983-10001",
    block: ""
  }
]

function VillageRow({ v }) {
  return (
    <tr className="even:bg-white odd:bg-gray-50">
      <td className="px-4 py-4">
        <div className="font-semibold text-gray-800">{v.name}</div>
        <div className="text-xs text-gray-500">{v.district ?? ''}</div>
      </td>

      <td className="px-4 py-4">
        <ContactCell contacts={v.contacts} role="PATWARI" />
      </td>

      <td className="px-4 py-4">
        <ContactCell contacts={v.contacts} role="SARPANCH" />
      </td>

      <td className="px-4 py-4">
        <ContactCell contacts={v.contacts} role="NUMBERDAR" />
      </td>

      <td className="px-4 py-4 text-center">
        <div className="text-sm font-medium text-gray-800">{v.ngoVillages?.length ?? 0}</div>
        <div className="text-xs text-gray-500">NGO(s)</div>
      </td>

      <td className="px-4 py-4">
        <Link
          to={`/villages/${v.id}`}
          className="inline-block px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
        >
          View Details
        </Link>
      </td>
    </tr>
  )
}

export default function Landing() {
  const [villages, setVillages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('ALL') // ALL | MOST | NEEDS | UNTOUCHED

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch('/api/api/villages')
      .then(r => {
        if (!r.ok) throw new Error('Network response not ok')
        return r.json()
      })
      .then(data => {
        setVillages(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to load villages')
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    if (!villages) return []
    switch (activeTab) {
      case 'MOST':
        return villages.filter(v => v.mostEffected === true || v.MostEffected === true)
      case 'NEEDS':
        return villages.filter(v => v.needsHelp === true || v.NeedsHelp === true)
      case 'UNTOUCHED':
        return villages.filter(v => (v.ngoVillages?.length ?? 0) === 0)
      default:
        return villages
    }
  }, [villages, activeTab])

  return (
    <div className="pb-12">
      {/* page container - keeps hero and table aligned */}
      <div className="container mx-auto px-4">

        {/* HERO / SUMMARY - now uses same horizontal rhythm as table */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg shadow-sm px-6 py-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">
            Saanjha Uprala – Rebuilding Together
          </h2>
          <p className="text-gray-700 leading-relaxed">
            The recent floods have significantly impacted several villages in our district,
            causing extensive damage to homes, infrastructure, and livelihoods. In this time
            of need, the District Administration of Amritsar is launching an initiative,
            <span className="font-semibold"> Saanjha Uprala</span>, to facilitate the adoption
            of these affected villages by interested organisations, NGOs, corporations, and individuals.
          </p>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">Browse flood affected villages</h3>
        {/* Filters + count — aligned with table */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1 rounded ${activeTab === 'ALL' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('MOST')}
                className={`px-3 py-1 rounded ${activeTab === 'MOST' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'}`}
              >
                Worst Affected
              </button>
              <button
                onClick={() => setActiveTab('NEEDS')}
                className={`px-3 py-1 rounded ${activeTab === 'NEEDS' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'}`}
              >
                Needs Help
              </button>
              <button
                onClick={() => setActiveTab('UNTOUCHED')}
                className={`px-3 py-1 rounded ${activeTab === 'UNTOUCHED' ? 'bg-slate-700 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'}`}
              >
                Untouched
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-800">{filtered.length}</span> of <span className="font-semibold">{villages.length}</span> villages
          </div>
        </div>

        {/* TABLE card - matches hero horizontal rhythm */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading villages…</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No villages found for this filter.</div>
          ) : (
            // ✅ scrollable wrapper with fixed height
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="min-w-full table-fixed">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="text-left">
                      <th className="px-4 py-3 w-1/4 text-sm text-gray-600">Village</th>
                      <th className="px-4 py-3 text-sm text-gray-600">Patwari</th>
                      <th className="px-4 py-3 text-sm text-gray-600">Sarpanch</th>
                      <th className="px-4 py-3 text-sm text-gray-600">Numberdar</th>
                      <th className="px-4 py-3 text-sm text-gray-600 text-center w-24">NGOs</th>
                      <th className="px-4 py-3 text-sm text-gray-600 w-36"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map(v => (
                      <VillageRow key={v.id} v={v} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <section className="mt-10">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Contact Details</h3>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="min-w-full table-fixed">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs text-gray-600">Officer</th>
                      <th className="px-3 py-3 text-left text-xs text-gray-600">Designation</th>
                      <th className="px-3 py-3 text-left text-xs text-gray-600">Department</th>
                      <th className="px-3 py-3 text-left text-xs text-gray-600">Mobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONTACTS.map((c, idx) => (
                      <tr key={idx} className="even:bg-white odd:bg-gray-50">
                        <td className="px-3 py-3 text-sm font-medium text-gray-800">{c.officer.toUpperCase()}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">{c.designation.toUpperCase()}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">{c.department}</td>
                        <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                          <a href={`tel:${c.mobile}`} className="text-emerald-600 hover:underline">{c.mobile}</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          </div>
        </section>


      </div>
    </div>
  )
}
