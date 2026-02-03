import { useState } from 'react'
import './App.css'
import { Login } from './components/Login'
import { Box, Button } from "@mui/material"
import { grey } from "@mui/material/colors"
import { Link } from 'react-router-dom'


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
        height: '100%',
        px: '100px',
        py: '100px'
      }}
      >
      <Box sx={{ fontWeight: 'bold', fontSize: '28px', marginBottom: '16px' }}>Login</Box>
      <Box sx={{ color: grey[500], fontWeight: 'bold', fontSize: '20px', marginBottom: '60px' }}>
        Art Exhibition Management System
      </Box>
      <Button
        variant='contained'
        size='large'
        onClick={() => window.location.href = '/pages/LoginPage.tsx'}
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

export default App
