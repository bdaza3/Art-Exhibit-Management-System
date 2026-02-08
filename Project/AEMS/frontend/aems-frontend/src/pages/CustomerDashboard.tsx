import { ClassNames } from "@emotion/react"
import { useNavigate } from "react-router-dom"
import "./CustomerDashboard.css"
import SideBar from "../components/SideBar"



export default function CustomerDashboard() {
  const navigate = useNavigate()
  const username = localStorage.getItem("username")

  const logout = () => {
    localStorage.clear()
    navigate("/")
  }

  return (
    <div className="dashboard-layout">
      <SideBar />

      <div className="dashboard-content">

        {/* HERO HEADER */}
        <div className="dash-header">
          <h2>Welcome back, {username} 🎨</h2>
          <button onClick={logout}>Logout</button>
        </div>

        {/* CARDS */}
        <div className="cards">

          <div
            className="card"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070)"
            }}
          >
            <h3>View / Buy Arts</h3>
            <p>Explore and purchase artworks</p>
          </div>

          <div
            className="card"
            style={{
              backgroundImage:
                "url(https://i.pinimg.com/736x/d4/e8/d1/d4e8d131a4465dd871963242f5b8770b.jpg)"
            }}
          >
            <h3>Upcoming Events</h3>
            <p>See future exhibitions</p>
          </div>

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
