import { Link, useLocation } from "react-router-dom"
import { Box, Button } from "@mui/material"
import { grey } from "@mui/material/colors"
import HouseIcon from '@mui/icons-material/House'
import SettingsIcon from '@mui/icons-material/Settings'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PeopleIcon from '@mui/icons-material/People'
import PaletteIcon from '@mui/icons-material/Palette'
import EventIcon from '@mui/icons-material/Event'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import PaymentIcon from '@mui/icons-material/Payment'

export default function SideBar({ activeOverride, onArtClick, onHomeClick }: { activeOverride?: string; onArtClick?: () => void; onHomeClick?: () => void }) {
  const location = useLocation()
  const activePath = activeOverride || location.pathname

  return (
    <Box
      sx={{
        height: '100vh',
        width: '150px',
        borderRight: '1px solid #d4af37',
        background: '#0f0f0f',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        zIndex: 999,
        overflowY: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
        <ItemButton title="Home" icon={<HouseIcon />} router="/customer" currentPath={activePath} onClick={onHomeClick} />
        <ItemButton title="Art" icon={<PaletteIcon />} router="/customer/art" currentPath={activePath} onClick={onArtClick} />
        <ItemButton title="Events" icon={<EventIcon />} router="/customer/events" currentPath={activePath} />
        <ItemButton title="Tickets" icon={<ConfirmationNumberIcon />} router="/customer/tickets" currentPath={activePath} />
        <ItemButton title="Cart" icon={<ShoppingCartIcon />} router="/customer/cart" currentPath={activePath} />
        <ItemButton title="Payments" icon={<PaymentIcon />} router="/customer/payments" currentPath={activePath} />
        <ItemButton title="Profile" icon={<PeopleIcon />} router="/customer/profile" currentPath={activePath} />
        <ItemButton title="Settings" icon={<SettingsIcon />} router="/customer/settings" currentPath={activePath} />
      </Box>
    </Box>
  )
}

const ItemButton = ({ title, icon, router, currentPath, onClick }: { title: string, icon: React.ReactNode, router: string, currentPath: string, onClick?: () => void }) => {
  const isActive = currentPath === router

  if (onClick) {
    return (
      <Button
        variant="text"
        onClick={onClick}
        sx={{
          color: isActive ? '#d4af37' : grey[400],
          fontSize: '13px',
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textTransform: 'none',
          borderLeft: isActive ? '3px solid #d4af37' : '3px solid transparent',
          borderRadius: 0,
          backgroundColor: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
          width: '100%',
          py: 1.2,
          transition: 'all 0.25s ease',
          '&:hover': {
            color: isActive ? '#d4af37' : grey[100],
            backgroundColor: isActive ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.05)',
          },
        }}
      >
        <span style={{ marginBottom: 0.1 }}>{icon}</span>
        <span>{title}</span>
      </Button>
    )
  }

  return (
    <Button
      variant="text"
      component={Link}
      to={router}
      sx={{
        color: isActive ? '#d4af37' : grey[400],
        fontSize: '13px',
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textTransform: 'none',
        borderLeft: isActive ? '3px solid #d4af37' : '3px solid transparent',
        borderRadius: 0,
        backgroundColor: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
        width: '100%',
        py: 1.2,
        transition: 'all 0.25s ease',
        '&:hover': {
          color: isActive ? '#d4af37' : grey[100],
          backgroundColor: isActive ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.05)',
        },
      }}
    >
      <span style={{ marginBottom: 0.1 }}>{icon}</span>
      <span>{title}</span>
    </Button>
  )
}
