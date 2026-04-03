import {Box, Button, Typography, Paper} from "@mui/material"
import {useEffect, useState, useMemo} from "react"
import { useNavigate, Link } from "react-router-dom"
import "./AdminDashboard.css"
import AdminSideBar from "../../components/admin/AdminSideBar"

const formatRelativeTime = (value: string | number | Date) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const absDiffInSeconds = Math.abs(diffInSeconds)
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  if (absDiffInSeconds < 60) {
    return formatter.format(diffInSeconds, "second")
  }

  const diffInMinutes = Math.round(diffInSeconds / 60)
  const absDiffInMinutes = Math.abs(diffInMinutes)

  if (absDiffInMinutes < 60) {
    return formatter.format(diffInMinutes, "minute")
  }

  const diffInHours = Math.round(diffInMinutes / 60)
  const absDiffInHours = Math.abs(diffInHours)

  if (absDiffInHours < 24) {
    return formatter.format(diffInHours, "hour")
  }

  const diffInDays = Math.round(diffInHours / 24)
  return formatter.format(diffInDays, "day")
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const username = localStorage.getItem("username") || "Curator"

  const [metrics, setMetrics] = useState({ artworks: 0, exhibitions: 0, upcomingExhibitions: 0, activeAuctions: 0, totalSales: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  const logout = () => {
    localStorage.clear()
    navigate("/")
  }

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [artsRes, exRes, exListRes, aucRes, ordersRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/artworks/"),
          fetch("http://127.0.0.1:8000/api/exhibitions/stats/"),
          fetch("http://127.0.0.1:8000/api/exhibitions/"),
          fetch("http://127.0.0.1:8000/api/auctions/"),
          fetch("http://127.0.0.1:8000/api/orders/"),
        ])

        const arts = await artsRes.json()
        const ex = await exRes.json()
        const exList = await exListRes.json()
        const auc = await aucRes.json()
        const orders = await ordersRes.json()

        const totalSales = Array.isArray(orders) ? orders.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0) : 0

        setMetrics({
          artworks: Array.isArray(arts) ? arts.length : 0,
          exhibitions: ex.total || 0,
          upcomingExhibitions: ex.upcoming || 0,
          activeAuctions: Array.isArray(auc) ? auc.filter((a: any) => a.status === 'active').length : 0,
          totalSales,
        })

        // upcoming exhibitions (by start date)
        if (Array.isArray(exList)) {
          const now = new Date()
          const upcomingSorted = exList
            .filter((e: any) => e.start_date && new Date(e.start_date) >= now)
            .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
            .slice(0, 5)
          setUpcoming(upcomingSorted)
        }

        if (Array.isArray(orders)) {
          const recent = orders.slice().sort((a: any,b: any) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime())).slice(0,5)
          setRecentOrders(recent)
        }

      } catch (err) {
        console.error(err)
      }
    }

    fetchAll()
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      <AdminSideBar />

      <div className="admin-page">
        <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0 }}>Welcome back, {username} 🎨</h1>
            <p className="muted">Here's the latest snapshot of your gallery and upcoming events.</p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Button variant="contained" onClick={() => navigate('/admin/events')} sx={{ bgcolor: '#d4af37', color: '#000', textTransform: 'none' }}>New Exhibition</Button>
            <Button variant="outlined" onClick={() => navigate('/admin/arts')} sx={{ color: '#000000', borderColor: '#d4af37', textTransform: 'none' }}>Add Artwork</Button>
            <Button onClick={logout} sx={{ color: '#fff', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)' }}>Logout</Button>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="management-grid" style={{ justifyContent: 'flex-start' }}>
            <div className="management-card">
              <Box>
                <Typography sx={{ color: '#d4af37', fontWeight: 700 }}>Total Sales</Typography>
                <Typography variant="h5">${metrics.totalSales.toFixed(2)}</Typography>
                <Typography variant="caption" className="muted">Last 30 days</Typography>
              </Box>
            </div>

            <div className="management-card">
              <Box>
                <Typography sx={{ color: '#d4af37', fontWeight: 700 }}>Artworks</Typography>
                <Typography variant="h5">{metrics.artworks}</Typography>
                <Typography variant="caption" className="muted">Total in collection</Typography>
              </Box>
            </div>

            <div className="management-card">
              <Box>
                <Typography sx={{ color: '#d4af37', fontWeight: 700 }}>Upcoming Exhibitions</Typography>
                <Typography variant="h5">{metrics.upcomingExhibitions}</Typography>
                <Typography variant="caption" className="muted">Scheduled</Typography>
              </Box>
            </div>

            <div className="management-card">
              <Box>
                <Typography sx={{ color: '#d4af37', fontWeight: 700 }}>Active Auctions</Typography>
                <Typography variant="h5">{metrics.activeAuctions}</Typography>
                <Typography variant="caption" className="muted">Live now</Typography>
              </Box>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginTop: 20 }}>
            <div>
              <Paper className="management-card panel-card" sx={{ padding: 12, background: 'linear-gradient(180deg, rgba(6,6,8,0.98), rgba(10,10,12,1))', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Typography variant="h6" sx={{ color: '#d4af37', paddingRight: 2 }}>Upcoming Exhibitions</Typography>
                <div style={{ marginTop: 10 }}>
                  {upcoming.length === 0 && <p className="muted">No upcoming exhibitions.</p>}
                  {upcoming.map((e: any) => (
                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{e.title}</div>
                        <div className="muted">Starts {e.start_date ? formatRelativeTime(e.start_date) : '—'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Button component={Link} to={`/admin/events/${e.id}`} size="small" sx={{ bgcolor: '#d4af37', color: '#000', textTransform: 'none' }}>Open</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Paper>
            </div>

            <div>
              <Paper className="management-card panel-card" sx={{ padding: 12, background: 'linear-gradient(180deg, rgba(6,6,8,0.98), rgba(10,10,12,1))', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Typography variant="h6" sx={{ color: '#d4af37', paddingRight: 2 }}>Recent Orders</Typography>
                <div style={{ marginTop: 10 }}>
                  {recentOrders.length === 0 && <p className="muted">No orders yet.</p>}
                  {recentOrders.map((o: any) => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>#{o.id} — {o.customer}</div>
                        <div className="muted">{o.created_at ? formatRelativeTime(o.created_at) : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="art-price">${Number(o.total || 0).toFixed(2)}</div>
                        <div className="model-badge">{o.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Paper>
            </div>
          </div>

          {/* Analytics metrics */}
          <div className="analytics-grid">
            <div className="metric-small">
              <div className="label">Ticket Sales (Past 30 days)</div>
              <div className="value">$0.00</div>
            </div>
            <div className="metric-small">
              <div className="label">Average Sale</div>
              <div className="value">$0.00</div>
            </div>
            <div className="metric-small">
              <div className="label">Visitors</div>
              <div className="value">0</div>
            </div>
            <div className="metric-small">
              <div className="label">Top Selling Artwork</div>
              <div className="value">N/A</div>
            </div>
          </div>

          <div className="analytics-bottom">
            <div className="chart-placeholder">
              <SalesSparkChart orders={recentOrders} />
            </div>
            <div className="top-list">
              <div style={{ fontWeight: 700, color: '#d4af37', marginBottom: 8 }}>Top 5 Artworks</div>
              <div className="muted">No data available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SalesSparkChart({ orders }: { orders: any[] }) {
  const series = useMemo(() => {
    const days = 7
    const labels: string[] = []
    const values: number[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))

      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      const dayEnd = dayStart + 24 * 60 * 60 * 1000

      const total = Array.isArray(orders)
        ? orders.reduce((s: number, o: any) => {
            const t = o.created_at ? new Date(o.created_at).getTime() : 0
            return t >= dayStart && t < dayEnd ? s + (Number(o.total) || 0) : s
          }, 0)
        : 0

      values.push(total)
    }

    return { labels, values }
  }, [orders])

  const max = Math.max(...series.values, 1)

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${series.values.length * 18} 60`} preserveAspectRatio="none" style={{ width: '100%', height: 60 }}>
        {series.values.map((v, i) => {
          const barH = Math.round((v / max) * 44)
          const x = i * 18 + 6
          const y = 52 - barH
          return (
            <rect key={i} x={x} y={y} width={10} height={barH} rx={2} fill="#d4af37" opacity={0.95} />
          )
        })}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
        {series.labels.map((lbl, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lbl}
          </div>
        ))}
      </div>
    </div>
  )
}
