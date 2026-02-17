import { ClassNames } from "@emotion/react"
import { useNavigate } from "react-router-dom"
//import "../CustomerDashboard.css"
import AdminSideBar from "../../components/admin/AdminSideBar"
import DashboardArtistsCard from "../../components/admin/DashboardArtistsCard"
//import DashboardArtworksCard from "../../components/admin/DashboardArtworksCard"

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

          <div
            className="card"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=2070)"
            }}
          >
            <h3>Buy Tickets</h3>
            <p>Reserve exhibition tickets</p>
          </div>

          <div
            className="card"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=2070)"
            }}
          >
            <h3>Make Payments</h3>
            <p>Secure online payments</p>
          </div>

        </div>

      </div>
    </div>
  )
}
