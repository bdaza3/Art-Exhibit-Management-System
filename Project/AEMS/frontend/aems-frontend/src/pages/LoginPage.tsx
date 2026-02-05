import { useState } from 'react'
import '../App.css'
import { Login } from '../components/Login'
import { Box, Button } from "@mui/material"
import { grey } from "@mui/material/colors"
import "./LoginPage.css"

export default function LoginPage() {
    return <Login />
}


// import { useState } from "react"
// import { useNavigate } from "react-router-dom"


// export default function LoginPage() {
//   const [username, setUsername] = useState("")
//   const [password, setPassword] = useState("")
//   const navigate = useNavigate()

//   const handleLogin = () => {
//     if (!username || !password) {
//       alert("Please enter username and password")
//       return
//     }

//     // later connect backend auth
//     alert(`Welcome ${username}!`)
//     navigate("/") // redirect after login
//   }

//   return (
//     <div className="login-bg">
//       <div className="login-card">
//         <h2 className="login-title">AEMS Login</h2>

//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button onClick={handleLogin}>LOGIN</button>
//       </div>
//     </div>
//   )
// }
