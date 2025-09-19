import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import VillageDetails from './pages/VillageDetails'
import Villages from './pages/Villages'
import ContactDetails from './pages/ContactDetails'
import NotFound from './pages/NotFound'
import NGORequestForm from './pages/NGORequestForm'
import RepairingHousesRequirements from './pages/RepairingHousesRequirements'
import AHDRequirements from './pages/AHDRequirements'
import SchoolStationaryRequirements from './pages/SchoolStationaryRequirements'
import MedicalHelpRequirements from './pages/MedicalHelpRequirements'

import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/Login'
import AdminRequests from './pages/admin/Requests'
import AdminRequestDetails from './pages/admin/AdminRequestDetails'
import ProtectedRoute from './pages/admin/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="villages" element={<Villages />} />
          <Route path="ContactDetails" element={<ContactDetails />} />
          <Route path="/requirements/animal-husbandry" element={<AHDRequirements />} />
          <Route path="/requirements/repair-houses" element={<RepairingHousesRequirements />} />
          <Route path="/requirements/school-stationary" element={<SchoolStationaryRequirements />} />
          <Route path="/requirements/medical-help" element={<MedicalHelpRequirements />} />
          <Route path="ContactDetails" element={<ContactDetails />} />
          <Route path="villages/:id" element={<VillageDetails />} />
          <Route path="ngos/adoptVillage" element={<NGORequestForm />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin section */}
        <Route path="/admin">
          <Route index element={<Navigate to="/admin/login" replace />} />
          <Route path="login" element={<AdminLogin />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="requests" element={<AdminRequests />} />
            <Route path="requests/:id" element={<AdminRequestDetails />} />
            {/* add other admin pages here */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
