// src/App.jsx
import Header from './components/Header'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Aviator from './components/Aviator'
import Deposit from './components/Deposit'
import DepositSuccess from './components/DepositSuccess'
import { Routes, Route } from 'react-router-dom'
import Profile from './components/Profile'
import AdminPackages from './components/Adminpackages'
import AdminDashboard from './components/Admin/Admindashboard'           // ← NEW
import AdminOverview from './components/Admin/Adminoverview'       // ← NEW
import AdminWithdrawals from './components/Admin/Adminwithdrawals' // ← NEW
import AdminUsers from './components/Admin/Adminusers'             // ← NEW
import AdminSettings from './components/Admin/Adminsettings'       // ← NEW
import UserRoute from "./routes/UserRoute"
import AdminRoute from "./routes/AdminRoute"

export default function App() {
  return (
    // ✅ Admin routes me Header NAHI dikhega (AdminDashboard ka apna header hai)
    // Normal routes me Header dikhega
    <Routes>

      {/* ── PUBLIC + USER ROUTES (with main Header) ── */}
      <Route element={<WithHeader />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />
        <Route path="/aviator" element={<UserRoute><Aviator /></UserRoute>} />
        <Route path="/deposit" element={<UserRoute><Deposit /></UserRoute>} />
        <Route path="/deposit/success" element={<UserRoute><DepositSuccess /></UserRoute>} />
      </Route>

      {/* ── ADMIN ROUTES (nested, apna Header hai) ── */}
      <Route
        path="/admin-dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />   {/* ← Layout component — header + <Outlet /> */}
          </AdminRoute>
        }
      >
        {/* index = /admin-dashboard */}
        <Route index element={<AdminOverview />} />

        {/* /admin-dashboard/packages */}
        <Route path="packages" element={<AdminPackages />} />

        {/* /admin-dashboard/withdrawals */}
        <Route path="withdrawals" element={<AdminWithdrawals />} />

        {/* /admin-dashboard/users */}
        <Route path="users" element={<AdminUsers />} />


        <Route path="bank" element={<AdminBank />} />

        {/* /admin-dashboard/settings */}
        <Route path="settings" element={<AdminSettings />} />
      </Route>

    </Routes>
  )
}

// ──────────────────────────────────────────────
// Helper: Normal pages ke liye Header wrapper
// ──────────────────────────────────────────────
import { Outlet } from 'react-router-dom'
import AdminBank from './components/Admin/AdminBank'

function WithHeader() {
  return (
    <div className="min-h-screen" style={{ background: '#070604' }}>
      <Header />
      <Outlet />
    </div>
  )
}