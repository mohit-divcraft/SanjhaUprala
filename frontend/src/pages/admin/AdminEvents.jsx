import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";

// AdminEvents.jsx
// CRUD for Events + nested EventImages manager (upload, reorder, caption)
// Assumes backend endpoints:
//  - GET    /api/events
//  - GET    /api/events/:id
//  - POST   /api/admin/events                 (Authorization: Bearer <token>)
//  - PUT    /api/admin/events/:id             (Authorization: Bearer <token>)
//  - DELETE /api/admin/events/:id             (Authorization: Bearer <token>)
//  - POST   /api/admin/events/upload-image    (multipart, field: 'image'; returns { src, thumb })
// Requires TailwindCSS. No external UI libs.

const API_BASE = "/api/api";

async function api(path, { method = "GET", body, auth = false, headers = {} } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth ? { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return res.status === 204 ? null : res.json();
}

async function uploadImage(file) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`${API_BASE}/admin/events/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return res.json(); // { src, thumb }
}

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // event or null

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => [e.title, e.location || "", e.description || ""].some((s) => s.toLowerCase().includes(q)));
  }, [events, search]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api("/events");
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function onCreate() {
    setEditing({});
  }
  function onEdit(ev) {
    setEditing(ev);
  }
  async function onDelete(ev) {
    if (!confirm(`Delete event "${ev.title}"?`)) return;
    try {
      await api(`/admin/events/${ev.id}`, { method: "DELETE", auth: true });
      await load();
    } catch (e) {
      alert("Failed to delete. " + e.message);
    }
  }

  async function onSubmit(form) {
    try {
      if (editing?.id) {
        await api(`/admin/events/${editing.id}`, { method: "PUT", auth: true, body: form });
      } else {
        await api(`/admin/events`, { method: "POST", auth: true, body: form });
      }
      setEditing(null);
      await load();
    } catch (e) {
      alert("Failed to save event. " + e.message);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin · Events</h1>
          <p className="text-slate-600 text-sm">Manage community events and photos</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="input input-bordered border rounded-md px-3 py-2 text-sm w-64"
          />
          <button onClick={onCreate} className="px-3 py-2 rounded-md bg-black text-white text-sm hover:bg-gray-800">+ Add Event</button>
        </div>
      </header>

      {error && <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">{error}</div>}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b text-sm text-slate-600">{loading ? "Loading…" : `${filtered.length} event(s)`}</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Location</th>
                <th className="px-4 py-3 text-left font-medium">Images</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev.id} className="border-t hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">{ev.title}</td>
                  <td className="px-4 py-3">{ev.date ? dayjs(ev.date).format("DD MMM YYYY") : <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3">{ev.location || <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3">{ev.images?.length || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(ev)} className="px-3 py-1.5 rounded-md text-xs bg-white border hover:bg-slate-50">Edit</button>
                      <button onClick={() => onDelete(ev)} className="px-3 py-1.5 rounded-md text-xs bg-white border text-rose-700 hover:bg-rose-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== null && (
        <EventFormDialog
          initial={Object.keys(editing).length ? editing : null}
          onCancel={() => setEditing(null)}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}

function EventFormDialog({ initial, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => ({
    title: initial?.title || "",
    description: initial?.description || "",
    date: initial?.date ? dayjs(initial.date).format("YYYY-MM-DDTHH:mm") : "",
    location: initial?.location || "",
    images: (initial?.images || []).map((im, idx) => ({ id: im.id, src: im.src, thumb: im.thumb || im.src, caption: im.caption || "", order: im.order ?? idx })),
  }));
  const fileInputRef = useRef(null);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setField(name, value);
  }

  function submit(e) {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      date: form.date ? new Date(form.date).toISOString() : null,
      location: form.location.trim() || null,
      images: form.images.map((im, idx) => ({ src: im.src, thumb: im.thumb || im.src, caption: im.caption || null, order: idx })),
    };
    if (!payload.title) return alert("Title is required");
    onSubmit(payload);
  }

  async function onPickFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      for (const f of files) {
        const { src, thumb } = await uploadImage(f);
        setForm((cur) => ({ ...cur, images: [...cur.images, { src, thumb, caption: "", order: cur.images.length }] }));
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert("Image upload failed: " + err.message);
    }
  }

  function removeImage(idx) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }
  function moveImage(idx, dir) {
    setForm((f) => {
      const arr = [...f.images];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return f;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...f, images: arr };
    });
  }
  function updateCaption(idx, value) {
    setForm((f) => {
      const arr = [...f.images];
      arr[idx] = { ...arr[idx], caption: value };
      return { ...f, images: arr };
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 overflow-auto">
      <form onSubmit={submit} className="w-full max-w-3xl bg-white rounded-xl border shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? "Edit Event" : "Add Event"}</h2>
          <button type="button" onClick={onCancel} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Title<span className="text-rose-600">*</span></label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Event title" required />
            </div>
            <div>
              <label className="block text-sm mb-1">Date & Time</label>
              <input type="datetime-local" name="date" value={form.date} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Venue or address" />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" rows={4} placeholder="Event details" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Images</label>
              <div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={onPickFiles} className="hidden" id="ev-up" />
                <label htmlFor="ev-up" className="px-3 py-2 rounded-md text-sm bg-slate-900 text-white hover:bg-slate-800 cursor-pointer">Upload</label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.images.map((im, idx) => (
                <div key={`${im.src}-${idx}`} className="border rounded-lg overflow-hidden">
                  <div className="aspect-[16/9] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={'/api'+(im.thumb || im.src)} alt={im.caption || ""} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 space-y-2">
                    <input
                      value={im.caption || ""}
                      onChange={(e) => updateCaption(idx, e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="Caption (optional)"
                    />
                    <div className="flex justify-between">
                      <div className="text-xs text-slate-500 truncate">{im.src}</div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => moveImage(idx, -1)} className="px-2 py-1 text-xs border rounded">↑</button>
                        <button type="button" onClick={() => moveImage(idx, +1)} className="px-2 py-1 text-xs border rounded">↓</button>
                        <button type="button" onClick={() => removeImage(idx)} className="px-2 py-1 text-xs border rounded text-rose-700">Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {form.images.length === 0 && (
                <div className="text-sm text-slate-500">No images yet. Use <strong>Upload</strong> to add some.</div>
              )}
            </div>
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
