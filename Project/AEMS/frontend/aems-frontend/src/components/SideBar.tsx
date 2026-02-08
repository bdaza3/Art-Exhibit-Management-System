import { useState } from "react"
import { Link } from "react-router-dom"
import "./SideBar.css"

export default function SideBar() {
  const [open, setOpen] = useState(true)

  return (
    <div className={`sidebar ${open ? "open" : "closed"}`}>

      {/* Toggle Button */}
      <button
        className="toggle-btn"
        onClick={() => setOpen(!open)}
      >
        {open ? "◀" : "▶"}
      </button>

      <ul>
        <li>
          🏠 {open && <span>Home</span>}
        </li>

        <li>
          👤 {open && <Link to="/profile"><span>Profile</span></Link>}
        </li>

        <li>
          ⚙️ {open && <span>Settings</span>}
        </li>

        <li>
          🛒 {open && <span>Cart</span>}
        </li>
      </ul>

    </div>
  )
}
