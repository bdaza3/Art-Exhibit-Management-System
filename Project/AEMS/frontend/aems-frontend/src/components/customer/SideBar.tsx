import { useLocation } from "react-router-dom"
import { Box } from "@mui/material"
import HouseIcon from '@mui/icons-material/House'
import SettingsIcon from '@mui/icons-material/Settings'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import EventIcon from '@mui/icons-material/Event'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import PaymentIcon from '@mui/icons-material/Payment'
import GavelIcon from '@mui/icons-material/Gavel'
import { ItemButton } from "./ItemButton"

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
        <ItemButton title="Events" icon={<EventIcon />} router="/customer/events" currentPath={activePath} />
        <ItemButton title="Tickets" icon={<ConfirmationNumberIcon />} router="/customer/tickets" currentPath={activePath} />
        <ItemButton title="Auctions" icon={<GavelIcon />} router="/customer/auctions" currentPath={activePath} />
        <ItemButton title="Cart" icon={<ShoppingCartIcon />} router="/customer/cart" currentPath={activePath} />
        <ItemButton title="Payments" icon={<PaymentIcon />} router="/customer/payments" currentPath={activePath} />
        <ItemButton title="Settings" icon={<SettingsIcon />} router="/customer/settings" currentPath={activePath} />
      </Box>
    </Box>
  )
}
