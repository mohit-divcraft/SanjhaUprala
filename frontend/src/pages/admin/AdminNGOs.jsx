import React, { useEffect, useMemo, useState } from "react";

// AdminNGOs.jsx
// CRUD screen for NGO model (id, name [unique], type, createdAt)
// Assumes backend endpoints:
//  - GET    /api/ngos
//  - GET    /api/ngos/:id
//  - POST   /api/admin/ngos
//  - PUT    /api/admin/ngos/:id
//  - DELETE /api/admin/ngos/:id
// Uses TailwindCSS and native fetch.

const API_BASE = "/api/api";

async function api(path, { method = "GET", body, auth = false } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth ? { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` } : {}),
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return res.status === 204 ? null : res.json();
}

export default function AdminNGOs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // NGO or null

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.name, r.type || ""].some((s) => s.toLowerCase().includes(q)));
  }, [rows, search]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api("/ngos");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to load NGOs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function onCreate() { setEditing({}); }
  function onEdit(row) { setEditing(row); }

  async function onDelete(row) {
    if (!confirm(`Delete NGO "${row.name}"?`)) return;
    try {
      await api(`/admin/ngos/${row.id}`, { method: "DELETE", auth: true });
      await load();
    } catch (e) {
      alert("Failed to delete NGO. " + e.message);
    }
  }

  async function onSubmit(form) {
    try {
      if (editing?.id) {
        await api(`/admin/ngos/${editing.id}`, { method: "PUT", auth: true, body: form });
      } else {
        await api(`/admin/ngos`, { method: "POST", auth: true, body: form });
      }
      setEditing(null);
      await load();
    } catch (e) {
      if (/already exists|P2002|unique/i.test(e.message)) {
        alert("NGO name already exists. Please choose a different name.");
      } else {
        alert("Failed to save NGO. " + e.message);
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin · NGOs</h1>
          <p className="text-slate-600 text-sm">Manage registered NGOs</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search NGOs…"
            className="input input-bordered border rounded-md px-3 py-2 text-sm w-64"
          />
          <button onClick={onCreate} className="px-3 py-2 rounded-md bg-black text-white text-sm hover:bg-gray-800">+ Add NGO</button>
        </div>
      </header>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">{error}</div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b text-sm text-slate-600">{loading ? "Loading…" : `${filtered.length} NGO(s)`}</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.type || <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(r)} className="px-3 py-1.5 rounded-md text-xs bg-white border hover:bg-slate-50">Edit</button>
                      <button onClick={() => onDelete(r)} className="px-3 py-1.5 rounded-md text-xs bg-white border text-rose-700 hover:bg-rose-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No NGOs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== null && (
        <NGOFormDialog
          initial={Object.keys(editing).length ? editing : null}
          onCancel={() => setEditing(null)}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}

function NGOFormDialog({ initial, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name || "",
    type: initial?.type || "",
  }));

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function submit(e) {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      type: form.type.trim() || null,
    };
    if (!payload.name) return alert("Name is required");
    onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-xl border shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? "Edit NGO" : "Add NGO"}</h2>
          <button type="button" onClick={onCancel} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm mb-1">Name<span className="text-rose-600">*</span></label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="NGO name"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Type</label>
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="e.g. Education, Health, Relief"
            />
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-3 py-2 rounded-md text-sm border">Cancel</button>
          <button type="submit" className="px-3 py-2 rounded-md text-sm bg-black text-white">Save</button>
        </div>
      </form>
    </div>
  );
}
