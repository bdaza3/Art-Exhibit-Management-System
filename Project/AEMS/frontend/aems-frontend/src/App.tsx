import { useState } from 'react'
import './App.css'
import { Login } from './components/Login'
import { Box, Button } from "@mui/material"
import { grey } from "@mui/material/colors"
import { Link, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'


function App() {

  return (
    <>
    <h1 style={{ color: 'red' }}>AEMS</h1>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: grey[50],
      }}
      >
      <Box sx={{ fontWeight: 'bold', fontSize: '28px', marginBottom: '16px' }}>Login</Box>
      <Box sx={{ color: grey[500], fontWeight: 'bold', fontSize: '20px', marginBottom: '60px' }}>
        Art Exhibition Management System
      </Box>
      <Button
        variant='contained'
        size='large'
        component={Link}
        to='/login'
        sx={{
          width: '330px',
          height: '56px',
        }}
      >
        Login
      </Button>
    </Box>
    </>
  )
}

function Home() {
  return <App />
}

export default function RootApp() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<LoginPage />} />
    </Routes>
  )
}
