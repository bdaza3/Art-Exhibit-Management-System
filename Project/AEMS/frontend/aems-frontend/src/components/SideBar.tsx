import { useState } from "react"
import { Link } from "react-router-dom"
import "./SideBar.css"
import HouseIcon from '@mui/icons-material/House'
import SettingsIcon from '@mui/icons-material/Settings'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PeopleIcon from '@mui/icons-material/People'

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
          <HouseIcon/> {open && <span>Home</span>}
        </li>

        <li>
          <PeopleIcon/> {open && <Link to="/customer/profile"><span>Profile</span></Link>}
        </li>

        <li>
          <SettingsIcon/> {open && <Link to="/customer/settings"><span>Settings</span></Link>}
        </li>

        <li>
          <ShoppingCartIcon/> {open && <Link to="/customer/cart"><span>Cart</span></Link>}
        </li>
      </ul>

    </div>
  )
}
