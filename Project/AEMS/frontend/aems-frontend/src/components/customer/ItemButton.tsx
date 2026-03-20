import { Button } from "@mui/material"
import { grey } from "@mui/material/colors"
import { Link } from "react-router-dom"


export const ItemButton = ({ title, icon, router, currentPath, onClick }: { title: string, icon: React.ReactNode, router: string, currentPath: string, onClick?: () => void }) => {
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
