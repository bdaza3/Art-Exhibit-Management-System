import { useState } from 'react';
import { useNavigate } from "react-router-dom"


export const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

   const fakeUsers = [
  { username: "customer", password: "123", role: "customer" },
  { username: "admin", password: "123", role: "admin" }
]

  const handleLogin = () => {
    if (!username || !password) {
      alert("Please enter username and password")
      return
    }

    // // later connect backend auth
    // alert(`Welcome ${username}!`)
    // navigate("/") // redirect after login

    //temp user role login logic - later replace with the backend 

    let role = ""

    if (username === "admin") role = "admin"
    else if (username === "super") role = "superadmin"
    else role = "customer"

    const foundUser = fakeUsers.find(
      u => u.username === username && u.password === password
    )

    if(!foundUser) {
      alert("Invalid Credentials")
      return
    }

    localStorage.setItem("user",JSON.stringify(foundUser))
    
    // save role
   

    alert(`Welcome ${foundUser.username}! Role: ${foundUser.role}`)

    // redirect by role
    if (foundUser.role === "customer") navigate("/customer")
    if (foundUser.role === "admin") navigate("/admin")
    if (foundUser.role === "superadmin") navigate("/superadmin")

  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="login-title">AEMS Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>LOGIN</button>
      </div>
    </div>
  )

 

}







