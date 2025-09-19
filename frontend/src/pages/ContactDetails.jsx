import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const CONTACTS = [
  {
    officer: "Smt. Sakshi Sawhney",
    designation: "Deputy Commissioner",
    department: "Administration",
    mobile: "81302-56305",
    block: ""
  },
  {
    officer: "Sh. Rohit Gupta",
    designation: "Additional Deputy Commissioner (G)",
    department: "Administration",
    mobile: "98150-08658",
    block: ""
  },
  {
    officer: "Smt. Amandeep Kaur",
    designation: "Additional Deputy Commissioner (Urban Development)",
    department: "Administration",
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

export default function ContactDetails() {

  return (
    <div className="pb-12">
      {/* page container - keeps hero and table aligned */}
      <div className="container mx-auto px-4">
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
