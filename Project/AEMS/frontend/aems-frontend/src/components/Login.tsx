import { useState } from 'react';
import { useNavigate, Link } from "react-router-dom"

const API_BASE = "http://localhost:8000/api/auth";

export const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter username and password")
      return
    }

    setError("")

    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Invalid credentials")
        return
      }

      const user = await res.json()
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("username", user.username)

      if (user.role === "customer") navigate("/customer")
      else if (user.role === "admin") navigate("/admin")
      else if (user.role === "superadmin") navigate("/superadmin")
    } catch {
      setError("Could not connect to server")
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="login-title">Login</h2>

        {error && <p style={{ color: "#ff6b6b", marginBottom: 10 }}>{error}</p>}

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

        <p style={{ marginTop: 20, color: "rgba(255,255,255,0.7)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#d4af37" }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}





