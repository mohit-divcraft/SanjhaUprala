import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const CONTACTS = [
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
  }
]

export default function AHDRequirements(){
  const [villages, setVillages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  return (
    <div>
      
<div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Animal Husbandry and Diary requirements</h2>
      </div>
         <section className="mt-10">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Contacts</h3>

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
                        <td className="px-3 py-3 text-sm font-medium text-gray-800">{c.officer}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">{c.designation}</td>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
       
      </div>
    </div>
  )
}
