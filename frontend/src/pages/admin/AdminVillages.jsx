import React, { useEffect, useMemo, useState } from "react";

// AdminVillages.jsx
// Drop this file anywhere inside your Admin module and add a route to render <AdminVillages />
// Assumes your backend routes exist at /api (from your index.js).
// Uses TailwindCSS utility classes.

const API_BASE = "/api/api"; // change if your proxy/base path differs

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

// --------------------------
// ROLE helpers
// --------------------------
const CONTACT_ROLES = ["PATWARI", "SARPANCH", "NUMBERDAR", "OTHER"];

function RoleBadge({ role }) {
  const color = useMemo(() => {
    switch (role) {
      case "PATWARI":
        return "bg-blue-50 text-blue-700 ring-blue-200";
      case "SARPANCH":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      case "NUMBERDAR":
        return "bg-amber-50 text-amber-700 ring-amber-200";
      default:
        return "bg-slate-50 text-slate-700 ring-slate-200";
    }
  }, [role]);
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ring-1 ${color}`}>{role}</span>
  );
}

// --------------------------
// AdminVillages (root)
// --------------------------
export default function AdminVillages() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showVillageForm, setShowVillageForm] = useState(false);
  const [editingVillage, setEditingVillage] = useState(null);

  const [contactsForVillage, setContactsForVillage] = useState(null); // village object when viewing contacts

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return villages;
    return villages.filter((v) =>
      [v.name, v.district ?? "", v.description ?? ""].some((s) =>
        s?.toLowerCase().includes(q)
      )
    );
  }, [search, villages]);

  async function loadVillages() {
    setLoading(true);
    setError("");
    try {
      const data = await api("/villages");
      setVillages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to load villages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVillages();
  }, []);

  function onCreateVillage() {
    setEditingVillage(null);
    setShowVillageForm(true);
  }

  function onEditVillage(v) {
    setEditingVillage(v);
    setShowVillageForm(true);
  }

  async function onDeleteVillage(v) {
    if (!confirm(`Delete village "${v.name}"? This cannot be undone.`)) return;
    try {
      await api(`/villages/${v.id}`, { method: "DELETE" });
      await loadVillages();
      if (contactsForVillage?.id === v.id) setContactsForVillage(null);
    } catch (e) {
      alert("Failed to delete village. " + e.message);
    }
  }

  async function onSubmitVillage(form) {
    try {
      if (editingVillage) {
        await api(`/villages/${editingVillage.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await api("/villages", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setShowVillageForm(false);
      setEditingVillage(null);
      await loadVillages();
    } catch (e) {
      alert("Failed to save village. " + e.message);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Villages</h1>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search villages…"
            className="input input-bordered border rounded-md px-3 py-2 text-sm w-64"
          />
          <button
            onClick={onCreateVillage}
            className="px-3 py-2 rounded-md bg-black text-white text-sm hover:bg-gray-800"
          >
            + Add Village
          </button>
        </div>
      </header>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VillageTable
            data={filtered}
            loading={loading}
            onEdit={onEditVillage}
            onDelete={onDeleteVillage}
            onManageContacts={setContactsForVillage}
          />
        </div>
        <div className="lg:col-span-1">
          {contactsForVillage ? (
            <ContactsPanel
              village={contactsForVillage}
              onClose={() => setContactsForVillage(null)}
            />
          ) : (
            <EmptyContactsHint />
          )}
        </div>
      </div>

      {showVillageForm && (
        <VillageFormDialog
          initial={editingVillage}
          onCancel={() => {
            setShowVillageForm(false);
            setEditingVillage(null);
          }}
          onSubmit={onSubmitVillage}
        />
      )}
    </div>
  );
}

function EmptyContactsHint() {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center text-slate-500">
      <div className="text-lg font-medium mb-1">Contacts</div>
      <div className="text-sm">Select a village to view & manage its contacts.</div>
    </div>
  );
}

// --------------------------
// Village Table
// --------------------------
function VillageTable({ data, loading, onEdit, onDelete, onManageContacts }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-4 border-b">
        <div className="text-sm text-slate-600">
          {loading ? "Loading…" : `${data.length} village(s)`}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">District</th>
              <th className="px-4 py-3 text-left font-medium">Flags</th>
              <th className="px-4 py-3 text-left font-medium">Contacts</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((v) => (
              <tr key={v.id} className="border-t hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="font-medium">{v.name}</div>
                  {v.description && (
                    <div className="text-xs text-slate-500 line-clamp-1">{v.description}</div>
                  )}
                </td>
                <td className="px-4 py-3">{v.district || <span className="text-slate-400">—</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 items-center">
                    {v.mostEffected && (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200">Most affected</span>
                    )}
                    {v.needsHelp && (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200">Needs help</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onManageContacts(v)}
                    className="px-3 py-1.5 rounded-md text-xs bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Manage Contacts
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(v)}
                      className="px-3 py-1.5 rounded-md text-xs bg-white border hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(v)}
                      className="px-3 py-1.5 rounded-md text-xs bg-white border text-rose-700 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No villages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --------------------------
// Village Create/Edit Dialog
// --------------------------
function VillageFormDialog({ initial, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name || "",
    district: initial?.district || "",
    description: initial?.description || "",
    mostEffected: initial?.mostEffected || false,
    needsHelp: initial?.needsHelp || false,
  }));

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function submit(e) {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      district: form.district.trim() || null,
      description: form.description.trim() || null,
      mostEffected: !!form.mostEffected,
      needsHelp: !!form.needsHelp,
    };
    if (!payload.name) return alert("Name is required");
    onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-xl bg-white rounded-xl border shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? "Edit Village" : "Add Village"}</h2>
          <button type="button" onClick={onCancel} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Name<span className="text-rose-600">*</span></label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Village name"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">District</label>
              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="District"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
              rows={3}
              placeholder="Notes"
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="mostEffected" checked={form.mostEffected} onChange={handleChange} />
              Most affected
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="needsHelp" checked={form.needsHelp} onChange={handleChange} />
              Needs help
            </label>
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

// --------------------------
// Contacts Panel (right side)
// --------------------------
function ContactsPanel({ village, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api(`/villages/${village.id}/contacts`);
      setContacts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [village.id]);

  async function onCreate(payload) {
    try {
      await api(`/villages/${village.id}/contacts`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setEditing(null);
      await load();
    } catch (e) {
      alert("Failed to create contact. " + e.message);
    }
  }

  async function onUpdate(payload) {
    try {
      await api(`/contacts/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setEditing(null);
      await load();
    } catch (e) {
      alert("Failed to update contact. " + e.message);
    }
  }

  async function onDelete(c) {
    if (!confirm(`Delete contact "${c.name}"?`)) return;
    try {
      await api(`/contacts/${c.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      alert("Failed to delete contact. " + e.message);
    }
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Village</div>
          <div className="font-semibold">{village.name}</div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {loading ? "Loading…" : `${contacts.length} contact(s)`}
          </div>
          <button
            onClick={() => setEditing({})}
            className="px-3 py-1.5 rounded-md text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            + Add Contact
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Phone</th>
                <th className="px-3 py-2 text-left font-medium">Role</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-t hover:bg-slate-50/50">
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2">{c.phone || <span className="text-slate-400">—</span>}</td>
                  <td className="px-3 py-2"><RoleBadge role={c.role} /></td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(c)}
                        className="px-3 py-1.5 rounded-md text-xs bg-white border hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(c)}
                        className="px-3 py-1.5 rounded-md text-xs bg-white border text-rose-700 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && contacts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                    No contacts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== null && (
        <ContactFormDialog
          initial={Object.keys(editing).length ? editing : null}
          onCancel={() => setEditing(null)}
          onSubmit={(payload) => (editing?.id ? onUpdate(payload) : onCreate(payload))}
        />
      )}
    </div>
  );
}

// --------------------------
// Contact Create/Edit Dialog
// --------------------------
function ContactFormDialog({ initial, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name || "",
    phone: initial?.phone || "",
    role: initial?.role || "PATWARI",
  }));

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function submit(e) {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      role: form.role,
    };
    if (!payload.name) return alert("Name is required");
    if (!CONTACT_ROLES.includes(payload.role)) return alert("Invalid role");
    onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-xl border shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? "Edit Contact" : "Add Contact"}</h2>
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
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="e.g. 98765-43210"
              pattern="[0-9+\-()\s]{6,}"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              {CONTACT_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
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
