import { useState } from "react"
import { Link } from "react-router-dom"
import {Box, Button} from "@mui/material"
import { grey } from "@mui/material/colors"
import DashboardIcon from '@mui/icons-material/Dashboard'
import ImageIcon from '@mui/icons-material/Image'
import EventIcon from '@mui/icons-material/Event'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
//import "./SideBar.css"

export default function AdminSideBar() {
  const [open, setOpen] = useState(true)

  return (
    <Box
      sx={{
        height: '100vh',
        width: '150px',
        borderRight: '1px solid #d4af37',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
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
      <ItemButton page="Dashboard" title="Dashboard" icon={<DashboardIcon />} router="/admin/dashboard"/>
      <ItemButton page="Arts" title="Artworks" icon={<ImageIcon />} router="/admin/arts"/>
      <ItemButton page="Events" title="Exhibitions" icon={<EventIcon />} router="/admin/events"/>
      <ItemButton page="Orders" title="Orders" icon={<ShoppingCartIcon />} router="/admin/orders"/>
      <ItemButton page="Customers" title="Customers" icon={<PeopleIcon />} router="/admin/customers"/>
      <ItemButton page="Reports" title="Reports" icon={<BarChartIcon />} router="/admin/reports"/>
    </Box>
    </Box>
    )
}

const ItemButton = ({ page, title, icon, router }: { page: string, title: string, icon: React.ReactNode, router: string }) => {
    return (
        <Button
            variant="text"
            component={Link}
            to={router}
            sx={{
                  color: grey[300],
                  fontSize: '13px',
                  mb: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textTransform: 'none',
                  '&:hover': {
                    color: grey[100],
                    backgroundColor: 'transparent',
                  },
                }}
            >
                <span style={{ marginBottom: 6 }}>{icon}</span>
                <span>{title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()}</span>
        </Button>
    )
}