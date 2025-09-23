import React, { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Govt Punjab Logo"
        className="h-10 w-10 md:h-12 md:w-12 object-contain"
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <div className="text-lg md:text-xl font-extrabold text-white">
            SAANJHA UPRALA
          </div>
          <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-xs font-semibold uppercase tracking-wide">
            Mission Chardikala
          </span>
        </div>
        <div className="text-xs md:text-sm text-white/85">
          An Initiative by the District Administration, Amritsar
        </div>
      </div>
    </div>
  )
}

/* Desktop-only dropdown (keeps your original behaviour) */
function RequirementsMenu() {
  return (
    <div className="relative group">
      <button
        aria-haspopup="true"
        aria-expanded="false"
        className="flex items-center gap-1 hover:text-yellow-300 focus:outline-none"
      >
        Relief Requirements
        <svg className="w-3 h-3 mt-[2px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      <div
        className="invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-150 absolute right-0 md:right-auto md:left-0 w-56 bg-white text-gray-800 rounded shadow-lg ring-1 ring-black/5 z-20"
        role="menu"
        aria-label="Requirements submenu"
      >
        <div className="py-2">
          <Link to="/requirements/animal-husbandry" className="block px-4 py-2 text-sm hover:bg-gray-50" role="menuitem">Animal Husbandry and Dairy</Link>
          <Link to="/requirements/repair-houses" className="block px-4 py-2 text-sm hover:bg-gray-50" role="menuitem">Damaged Houses</Link>
          <Link to="/requirements/school-stationary" className="block px-4 py-2 text-sm hover:bg-gray-50" role="menuitem">School Stationary</Link>
          <Link to="/requirements/medical-help" className="block px-4 py-2 text-sm hover:bg-gray-50" role="menuitem">Medical Help</Link>
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileReqOpen, setMobileReqOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* header is relative so mobile menu can be absolute (not affect layout height) */}
      <header className="relative bg-emerald-700 text-white shadow">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-6 text-white/90">
            <Link to="/" className="hover:text-yellow-300">Home</Link>
            <Link to="/ContactDetails" className="hover:text-yellow-300">Contact</Link>
            <Link to="/villages" className="hover:text-yellow-300">Villages</Link>
            <Link to="/EventsGallery" className="hover:text-yellow-300">Gallery</Link>

            <RequirementsMenu />

            <Link
              to="/ngos/adoptVillage"
              aria-label="Adopt a Village - Get involved"
              className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-emerald-900 font-semibold shadow-md hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
            >
              Adopt a Village
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(v => !v)}
              className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <span className="sr-only">Open menu</span>
              {mobileOpen ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile panel: ABSOLUTE so it doesn't affect header height when closed */}
        <div
          id="mobile-menu"
          className={`md:hidden absolute left-0 right-0 top-full z-40 transform origin-top transition-all duration-200
            ${mobileOpen ? 'opacity-100 pointer-events-auto scale-y-100' : 'opacity-0 pointer-events-none scale-y-0'}`}
        >
          <div className="bg-emerald-700/95 border-t border-emerald-600 max-h-[60vh] overflow-auto">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link to="/" onClick={() => setMobileOpen(false)} className="block text-white/95 px-2 py-2 rounded hover:bg-white/10">Home</Link>
              <Link to="/ContactDetails" onClick={() => setMobileOpen(false)} className="block text-white/95 px-2 py-2 rounded hover:bg-white/10">Contact</Link>
              <Link to="/villages" onClick={() => setMobileOpen(false)} className="block text-white/95 px-2 py-2 rounded hover:bg-white/10">Villages</Link>
              <Link to="/EventsGallery" onClick={() => setMobileOpen(false)} className="block text-white/95 px-2 py-2 rounded hover:bg-white/10">Gallery</Link>
              {/* Mobile Requirements accordion */}
              <div>
                <button
                  onClick={() => setMobileReqOpen(s => !s)}
                  aria-expanded={mobileReqOpen}
                  className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-white/10 focus:outline-none text-white/95"
                >
                  <span>Relief Requirements</span>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className={`pl-4 mt-2 space-y-1 ${mobileReqOpen ? 'block' : 'hidden'}`}>
                  <Link to="/requirements/animal-husbandry" onClick={() => { setMobileOpen(false); setMobileReqOpen(false) }} className="block px-2 py-2 rounded hover:bg-white/10">Animal Husbandry and Dairy</Link>
                  <Link to="/requirements/repair-houses" onClick={() => { setMobileOpen(false); setMobileReqOpen(false) }} className="block px-2 py-2 rounded hover:bg-white/10">Damaged Houses</Link>
                  <Link to="/requirements/school-stationary" onClick={() => { setMobileOpen(false); setMobileReqOpen(false) }} className="block px-2 py-2 rounded hover:bg-white/10">School Stationary</Link>
                  <Link to="/requirements/medical-help" onClick={() => { setMobileOpen(false); setMobileReqOpen(false) }} className="block px-2 py-2 rounded hover:bg-white/10">Medical Help</Link>
                </div>
              </div>

              <Link
                to="/ngos/adoptVillage"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-emerald-900 font-semibold shadow-md hover:brightness-95"
              >
                Adopt a Village
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between">
          <div>© {new Date().getFullYear()} SANJHA UPRALA</div>
          <div className="text-sm mt-2 md:mt-0">Built with ❤️ for communities</div>
        </div>
      </footer>
    </div>
  )
}
