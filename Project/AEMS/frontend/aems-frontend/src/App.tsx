import { useState } from 'react'
import './App.css'
import { Login } from './components/Login'
import { Box, Button } from "@mui/material"
import { grey } from "@mui/material/colors"
import { Link, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import bgImage from "./assets/background_image.jpg"
import CustomerDashboard from "./pages/customer/CustomerDashboard"
import AdminDashboard from "./pages/admin/AdminDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import ProfilePage from "./pages/ProfilePage"

function App() {

  // return (
  //   <>
  //   <h1 style={{ color: 'red' }}>AEMS</h1>
  //   <Box
  //     sx={{
  //       display: 'flex',
  //       flexDirection: 'column',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       bgcolor: grey[50],
  //     }}
  //     >
  //     <Box sx={{ fontWeight: 'bold', fontSize: '28px', marginBottom: '16px' }}>Login</Box>
  //     <Box sx={{ color: grey[500], fontWeight: 'bold', fontSize: '20px', marginBottom: '60px' }}>
  //       Art Exhibition Management System
  //     </Box>
  //     <Button
  //       variant='contained'
  //       size='large'
  //       component={Link}
  //       to='/login'
  //       sx={{
  //         width: '330px',
  //         height: '56px',
  //       }}
  //     >
  //       Login
  //     </Button>
  //   </Box>
  //   </>
  // )

return (
    <div className="hero">
      
      {/* NAVBAR */}
      <nav className="nav">
        <div className="logo">AEMS</div>
        <div className="nav-links">
          <a>
            <Link to="/">Home</Link>
          </a>
          <a>Exhibitions</a>
          <a>Artists</a>
          <a>Contact</a>
        </div>
      
      </nav>
      <div className="nav-border"></div>
      {/* CENTER CONTENT */}
      <div className="hero-content">
        <h1>Welcome to AEMS</h1>
        <p>Art Exhibition Management System</p>
        <Link to="/login">
        <button className="hero-btn">LOGIN</button>
        </Link>
      </div>

    </div>

    
  )


}

function Home() {
  return <App />
}

export default function RootApp() {
  return (
   <Routes>

      {/* Public Routes */}
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path='/customer'
        element={
          <ProtectedRoute role="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path='/admin'
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route 
        path='/profile' 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

    </Routes>
  )
}
