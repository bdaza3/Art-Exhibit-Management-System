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
import AdminArts from "./pages/admin/AdminArtworks"
import AdminExhibitions from "./pages/admin/AdminExhibitions"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminCustomers from "./pages/admin/AdminCustomers"
import AdminReports from "./pages/admin/AdminReports"
import AdminAuctions from "./pages/admin/AdminAuctions"
import ProtectedRoute from "./components/ProtectedRoute"
import ProfilePage from "./pages/ProfilePage"
import CartPage from "./pages/CartPage";
import SettingsPage from "./pages/SettingsPage";
import ViewBuyArtPage from "./pages/ViewBuyArtPage";
import UpcomingEventsPage from './pages/UpcomingEventsPage'
import BuyTicketsPage from './pages/BuyTicketsPage'
import MakePaymentsPage from './pages/MakePaymentsPage'

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
        path='/admin/dashboard'
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path='/admin/arts'
        element={
          <ProtectedRoute role="admin">
            <AdminArts />
          </ProtectedRoute>
        }
      />

      <Route
        path='/admin/events'
        element={
          <ProtectedRoute role="admin">
            <AdminExhibitions />
          </ProtectedRoute>
        }
      />

      <Route
        path='/admin/auctions'
        element={
          <ProtectedRoute role="admin">
            <AdminAuctions />
          </ProtectedRoute>
        }
      />

      <Route
        path='/admin/orders'
        element={
          <ProtectedRoute role="admin">
            <AdminOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path='/admin/customers'
        element={
          <ProtectedRoute role="admin">
            <AdminCustomers />
          </ProtectedRoute>
        }
      />

      <Route
        path='/admin/reports'
        element={
          <ProtectedRoute role="admin">
            <AdminReports />
          </ProtectedRoute>
        }
      />

      <Route 
        path='/customer/profile' 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
  path="/customer/cart"
  element={
    <ProtectedRoute role="customer">
      <CartPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer/art"
  element={
    <ProtectedRoute role="customer">
      <ViewBuyArtPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer/events"
  element={
    <ProtectedRoute role="customer">
      <UpcomingEventsPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer/tickets"
  element={
    <ProtectedRoute role="customer">
      <BuyTicketsPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer/settings"
  element={
    <ProtectedRoute role="customer">
      <SettingsPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer/payments"
  element={
    <ProtectedRoute role="customer">
      <MakePaymentsPage />
    </ProtectedRoute>
  }
/>
    </Routes>
  )
}
