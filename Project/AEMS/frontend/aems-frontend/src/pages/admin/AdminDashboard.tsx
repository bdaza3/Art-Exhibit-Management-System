import { ClassNames } from "@emotion/react"
import {Box, Button, Typography, List, Container, Grid, Divider, Paper, Card, CardContent} from "@mui/material"
import {useEffect, useState} from "react"
import { useNavigate, Link } from "react-router-dom"
import "../customer/CustomerDashboard.css"
import "./AdminDashboard.css"
import AdminSideBar from "../../components/admin/AdminSideBar"
import BrushIcon from '@mui/icons-material/Brush'
import EventIcon from '@mui/icons-material/Event'
import GavelIcon from '@mui/icons-material/Gavel'
import AnalyticsIcon from '@mui/icons-material/Analytics'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const username = localStorage.getItem("username")
  const [metrics, setMetrics] = useState({ artworks: 0, exhibitions: 0, upcomingExhibitions: 0, activeAuctions: 0 })

  const logout = () => {
    localStorage.clear()
    navigate("/")
  }

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [artsRes, exRes, aucRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/artworks/"),
          fetch("http://127.0.0.1:8000/api/exhibitions/stats/"),
          fetch("http://127.0.0.1:8000/api/auctions/"),
        ])

        const arts = await artsRes.json()
        const ex = await exRes.json()
        const auc = await aucRes.json()

        setMetrics({
          artworks: Array.isArray(arts) ? arts.length : 0,
          exhibitions: ex.total || 0,
          upcomingExhibitions: ex.upcoming || 0,
          activeAuctions: Array.isArray(auc) ? auc.filter((a: any) => a.status === 'active').length : 0,
        })
      } catch (err) {
        console.error(err)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <div className="dashboard-layout">
      <AdminSideBar />

      <div className="dashboard-content">

        {/* HERO HEADER */}
        <div className="dash-header">
          <h2>Welcome back, {username} 🎨</h2>
          <button onClick={logout}>Logout</button>
        </div>

        {/* DASHBOARD OVERVIEW */}

        {/* MANAGEMENT ACTIONS */}
        <div style={{marginTop: 16}}>

          <div className="management-grid">
            <div className="management-actions">
                  <Paper
                    elevation={2}
                    className="management-card"
                    sx={{
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(16,16,16,0.7))',
                      border: '1px solid rgba(212,175,55,0.22)',
                      height: 140,
                      width: 240,
                      minWidth: 220,
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 1.75,
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <BrushIcon sx={{ fontSize: 32, color: '#d4af37', mr: 1.5 }} />
                      <Box>
                        <Typography sx={{ color: '#d4af37', fontWeight: 600 }}>Manage Artworks</Typography>
                        <Typography variant="body2" sx={{ color: '#ddd' }}>View, add, edit, delete artworks and enable auctions.</Typography>
                        <Box mt={1}>
                          <Button component={Link} to="/admin/arts" size="small" sx={{ bgcolor: '#d4af37', color: '#000', fontWeight: 600, textTransform: 'none', '&:hover': { opacity: 0.95 } }}>Open</Button>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    elevation={2}
                    className="management-card"
                    sx={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(16,16,16,0.7))', border: '1px solid rgba(212,175,55,0.22)', height: 140, width: 240, minWidth: 220, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: 1.75 }}
                  >
                    <Box display="flex" alignItems="center">
                      <EventIcon sx={{ fontSize: 32, color: '#d4af37', mr: 1.5 }} />
                      <Box>
                        <Typography sx={{ color: '#d4af37', fontWeight: 600 }}>Manage Exhibitions</Typography>
                        <Typography variant="body2" sx={{ color: '#ddd' }}>Create and publish upcoming or ongoing exhibitions.</Typography>
                        <Box mt={1}>
                          <Button component={Link} to="/admin/events" size="small" sx={{ bgcolor: '#d4af37', color: '#000', fontWeight: 600, textTransform: 'none', '&:hover': { opacity: 0.95 } }}>Open</Button>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    elevation={2}
                    className="management-card"
                    sx={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(16,16,16,0.7))', border: '1px solid rgba(212,175,55,0.22)', height: 140, width: 240, minWidth: 220, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: 1.75 }}
                  >
                    <Box display="flex" alignItems="center">
                      <GavelIcon sx={{ fontSize: 32, color: '#d4af37', mr: 1.5 }} />
                      <Box>
                        <Typography sx={{ color: '#d4af37', fontWeight: 600 }}>Manage Auctions</Typography>
                        <Typography variant="body2" sx={{ color: '#ddd' }}>Configure live bidding and monitor active auctions.</Typography>
                        <Box mt={1}>
                          <Button component={Link} to="/admin/auctions" size="small" sx={{ bgcolor: '#d4af37', color: '#000', fontWeight: 600, textTransform: 'none', '&:hover': { opacity: 0.95 } }}>Open</Button>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    elevation={2}
                    className="management-card"
                    sx={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(16,16,16,0.7))', border: '1px solid rgba(212,175,55,0.22)', height: 140, width: 240, minWidth: 220, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: 1.75 }}
                  >
                    <Box display="flex" alignItems="center">
                      <AnalyticsIcon sx={{ fontSize: 32, color: '#d4af37', mr: 1.5 }} />
                      <Box>
                        <Typography sx={{ color: '#d4af37', fontWeight: 600 }}>Reports & Analytics</Typography>
                        <Typography variant="body2" sx={{ color: '#ddd' }}>View sales, auctions, and customer trends; export reports.</Typography>
                        <Box mt={1}>
                          <Button component={Link} to="/admin/reports" size="small" sx={{ bgcolor: '#d4af37', color: '#000', fontWeight: 600, textTransform: 'none', '&:hover': { opacity: 0.95 } }}>Open</Button>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
            </div>
          </div>
        </div>

        {/* QUICK METRICS */}
        <div style={{marginTop: 20}}>
          <Typography variant="h6" gutterBottom>
            Quick Metrics
          </Typography>
          <Grid container spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">Total Artworks</Typography>
                  <Typography variant="h6">{metrics.artworks}</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">Total Exhibitions</Typography>
                  <Typography variant="h6">{metrics.exhibitions}</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">Upcoming Exhibitions</Typography>
                  <Typography variant="h6">{metrics.upcomingExhibitions}</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">Active Auctions</Typography>
                  <Typography variant="h6">{metrics.activeAuctions}</Typography>
                </CardContent>
              </Card>
            </Grid>
        </div>
      </div>
    </div>
  )
}
