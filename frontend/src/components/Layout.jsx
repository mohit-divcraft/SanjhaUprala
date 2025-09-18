import React from 'react'
import { Link, Outlet } from 'react-router-dom'

function Logo(){
  // simple inline SVG logo
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold shadow">
        SU
      </div>
      <div>
        <div className="text-xl font-extrabold leading-tight text-white">SANJHA UPRALA</div>
        <div className="text-sm text-white/80">Community · Support · Uplift</div>
      </div>
    </div>
  )
}

export default function Layout(){
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="bg-emerald-700 text-white shadow">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-white/90">
            <Link to="/" className="hover:text-yellow-300">Home</Link>
            <Link to="/" className="hover:text-yellow-300">Villages</Link>
            <Link to="/requirements" className="hover:text-yellow-300">Requirements</Link>
            {/* <Link to="/ngos" className="hover:text-yellow-300">NGOs</Link> */}
            <Link to="/ngos/adoptVillage">Adopt a Village</Link>
          </nav>

          <div className="md:hidden">
            <Link to="/" className="px-3 py-1 border rounded bg-white/10">Menu</Link>
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
