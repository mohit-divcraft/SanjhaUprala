import React, { useState, useEffect } from "react";

// EventsGallery.jsx
// A page-style gallery that displays multiple events (title, date, location, long
// description) and an image gallery per event with lightbox and carousel controls.
// Built with TailwindCSS. Export default component below.

export default function EventsGallery({ events = null, fetchUrl = "/api/api/events" }) {
  const [allEvents, setAllEvents] = useState(events ?? []);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [activeLightbox, setActiveLightbox] = useState({ eventIdx: -1, imgIdx: 0 });

  useEffect(() => {
    if (!events) {
      setLoading(true);
      fetch(fetchUrl)
        .then((r) => r.json())
        .then((data) => setAllEvents(data || []))
        .catch((e) => console.error("Failed to load events:", e))
        .finally(() => setLoading(false));
    }
  }, [events, fetchUrl]);

  // derive categories (e.g. "Flood", "Cleanliness", "Rehab") from events
  const categories = ["All", ...Array.from(new Set(allEvents.flatMap((ev) => ev.tags || [])) )];
  const visibleEvents = filter === "All" ? allEvents : allEvents.filter((e) => (e.tags || []).includes(filter));

  // open lightbox for event i image j
  function openLightbox(eventIdx, imgIdx) {
    setActiveLightbox({ eventIdx, imgIdx });
  }

  // lightbox navigation
  function navigateLightbox(delta) {
    const { eventIdx, imgIdx } = activeLightbox;
    if (eventIdx === -1) return;
    const images = visibleEvents[eventIdx]?.images || [];
    let next = imgIdx + delta;
    if (next < 0) next = 0;
    if (next >= images.length) next = images.length - 1;
    setActiveLightbox({ eventIdx, imgIdx: next });
  }

  return (
    <div className="pb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Gallery</h2>
        <p className="text-gray-600 text-sm">Recent activities, campaigns and rehabilitation works across villages.</p>
      </div>

      {/* <div className="flex items-center justify-between gap-4 mb-6 flex-col sm:flex-row">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm">Filter:</label>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 rounded-full text-sm border ${filter === c ? 'bg-sky-600 text-white' : 'bg-white'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="text-sm text-slate-500">{visibleEvents.length} events</div>
      </div> */}

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading events...</div>
      ) : visibleEvents.length === 0 ? (
        <div className="py-20 text-center text-slate-500">No events to show.</div>
      ) : (
        <div className="space-y-8">
          {visibleEvents.map((ev, evIdx) => (
            <article key={ev.id || evIdx} className="bg-white rounded-xl shadow p-5">
              <div className="md:flex md:items-start md:gap-6">
                <div className="md:w-1/3">
                  {ev.images && ev.images.length > 0 ? (
                    <img
                      src={'/api'+(ev.images[0].thumb || ev.images[0].src)}
                      alt={ev.title}
                      className="w-full h-48 object-cover rounded"
                      loading="lazy"
                      onClick={() => openLightbox(evIdx, 0)}
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center rounded bg-slate-100 text-slate-400">No image</div>
                  )}

                  <div className="mt-3 text-xs text-slate-500">
                    <span className="font-medium">Location:</span> {ev.location}
                  </div>
                  {/* <div className="mt-1 text-xs text-slate-500">
                    <span className="font-medium">Date:</span> {ev.date}
                  </div> */}

                  <div className="mt-3 flex gap-2 flex-wrap">
                    {(ev.tags || []).map((t) => (
                      <span key={t} className="text-xs px-2 py-1 rounded bg-slate-100">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="md:flex-1 mt-4 md:mt-0">
                  <h2 className="text-xl font-semibold">{ev.title}</h2>
                  <p className="mt-3 text-slate-700 whitespace-pre-line">{ev.description}</p>

                  {/* image thumbnails */}
                  {ev.images && ev.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
                      {ev.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => openLightbox(evIdx, i)}
                          className="rounded overflow-hidden bg-slate-50"
                        >
                          <img src={'/api'+(ev.images[i].thumb || ev.images[i].src)} alt={img.alt || ev.title} className="w-full h-20 object-cover block" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* actions */}
                  {/* <div className="mt-4 flex gap-3">
                    <a
                      href={ev.readMoreUrl || '#'}
                      className="px-3 py-1 rounded bg-sky-50 text-sky-700 text-sm border"
                    >
                      Read more
                    </a>
                    <button
                      onClick={() => navigator.clipboard && navigator.clipboard.writeText(window.location.href)}
                      className="px-3 py-1 rounded border text-sm"
                    >
                      Share
                    </button>
                  </div> */}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Lightbox modal (global) */}
      {activeLightbox.eventIdx !== -1 && visibleEvents[activeLightbox.eventIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setActiveLightbox({ eventIdx: -1, imgIdx: 0 })}
        >
          <div className="max-w-[95vw] max-h-[90vh] w-full relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={'/api'+visibleEvents[activeLightbox.eventIdx].images[activeLightbox.imgIdx].src}
              alt={visibleEvents[activeLightbox.eventIdx].images[activeLightbox.imgIdx].alt || ''}
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />

            <button onClick={() => setActiveLightbox({ eventIdx: -1, imgIdx: 0 })} className="absolute top-3 right-3 bg-white/90 rounded-full p-2">✕</button>
            <button onClick={() => navigateLightbox(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2">◀</button>
            <button onClick={() => navigateLightbox(1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2">▶</button>

            <div className="absolute left-4 bottom-4 bg-white/90 rounded px-3 py-1 text-sm">
              {visibleEvents[activeLightbox.eventIdx].images[activeLightbox.imgIdx].caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*
Server JSON shape expected (array of events):

[
  {
    "id": "event-1",
    "title": "Flood rehabilitation and desilting work Launched at Ajnala",
    "date": "2025-09-14",
    "location": "Ajnala, Amritsar",
    "tags": ["Flood", "Rehabilitation", "Desilting"],
    "description": "In a significant step towards flood relief and rehabilitation, Padma Shri Dr. Vikramjit Singh Sahney...",
    "readMoreUrl": "/events/event-1",
    "images": [
      { "src": "/media/events/event-1/1.jpg", "thumb": "/media/events/event-1/1-thumb.jpg", "caption": "JCB at work", "alt": "JCB machine desilting" },
      { "src": "/media/events/event-1/2.jpg", "thumb": "/media/events/event-1/2-thumb.jpg", "caption": "Tractors deployed", "alt": "Tractor convoy" }
    ]
  },
  ...
]

Integration notes:
- Place this file in your React app as `EventsGallery.jsx` and import into a page.
- TailwindCSS required for styling. If you use plain CSS, I can convert it.
- Use thumbnails for grid and full-size images in the lightbox (keep file sizes optimized).
- Consider server-side pagination for many events.

Would you like me to:
- Convert this to a Next.js page with server-side rendering and an API route that reads your uploaded images and event text?
- Generate sample event JSON from the event texts you provided (I can create 4–6 dummy events with images placeholders)?
- Add an admin form UI to create/edit events (title, description, tags, upload images)?
*/
