// src/pages/admin/AdminHome.jsx
import React from "react"
import { Link } from "react-router-dom"

export default function AdminHome() {
  const items = [
    {
      title: "Requests",
      description: "Review and manage NGO requests submitted from the public site.",
      to: "/admin/requests",
    },
    {
      title: "Villages",
      description: "Create, edit, and delete villages. Manage village contacts.",
      to: "/admin/villages",
    },
    {
      title: "Events",
      description: "Manage events and upload images of events",
      to: "/admin/events",
    },
    {
      title: "NGOs",
      description: "Manage ngos and their details",
      to: "/admin/ngos",
    },
    // Add more items as you grow the admin: Users, Reports, Settings, etc.
  ]

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-slate-600 text-sm">Quick links to manage Sanjha Uprala data</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it) => (
          <Link
            key={it.title}
            to={it.to}
            className="group block rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{it.title}</h2>
                <span className="text-slate-400 group-hover:text-slate-700">→</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{it.description}</p>
            </div>
            <div className="px-5 py-3 bg-slate-50 text-sm text-slate-700 rounded-b-xl">
              Open {it.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
