// src/App.jsx — Aapka EXISTING App.jsx — sirf deposit/success route add kiya

import Header from './components/Header'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Aviator from './components/Aviator'
import Deposit from './components/Deposit'
import DepositSuccess from './components/DepositSuccess'     // ← NEW
import { Routes, Route } from 'react-router-dom'


export default function App() {
  return (
    <div className="min-h-screen" style={{ background: '#070604' }}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/aviator" element={<Aviator />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/deposit/success" element={<DepositSuccess />} />  {/* ← NEW */}
      </Routes>
    </div>
  )
}