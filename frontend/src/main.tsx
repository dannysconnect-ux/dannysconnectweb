import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

// Import all your components
import HomePage from './HomePage.tsx'
import Login from './Login.tsx'
import UserDetails from './UserDetails.tsx'
import Dashboard from './StudentDashboard.tsx'
import Signup from './Signup.tsx'
import AdminDashboard from './AdminDashboard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Authentication & Onboarding Flow */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/setup-profile" element={<UserDetails />} />
        
        {/* Student Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)