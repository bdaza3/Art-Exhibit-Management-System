import { ClassNames } from "@emotion/react"
import { useNavigate, Link } from "react-router-dom"
import "../customer/CustomerDashboard.css"
import AdminSideBar from "../../components/admin/AdminSideBar"
import DashboardArtistsCard from "../../components/admin/DashboardArtistsCard"
import DashboardArtworksCard from "../../components/admin/DashboardArtworksCard"
import DashboardEventsCard from "../../components/admin/DashboardEventsCard"
import DashboardOrdersCard from "../../components/admin/DashboardOrdersCard"
import DashboardCustomersCard from "../../components/admin/DashboardCustomersCard"
import DashboardReportsCard from "../../components/admin/DashboardReportsCard"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const username = localStorage.getItem("username")

  const logout = () => {
    localStorage.clear()
    navigate("/")
  }

  return (
    <div className="dashboard-layout">
      <AdminSideBar />

      <div className="dashboard-content">

        {/* HERO HEADER */}
        <div className="dash-header">
          <h2>Welcome back, {username} 🎨</h2>
          <button onClick={logout}>Logout</button>
        </div>

        {/* CARDS */}
        <div className="cards">
          <DashboardArtistsCard />
          <DashboardArtworksCard />
          <DashboardEventsCard />
          <DashboardOrdersCard />
          <DashboardCustomersCard />
          <DashboardReportsCard />
        </div>
      </div>
    </div>
  )
}
