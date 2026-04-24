import { useState } from 'react';
import { useNavigate, Link } from "react-router-dom"

const API_BASE = "http://localhost:8000/api/auth";

export default function Register() {
  const isDevMode = import.meta.env.DEV
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleRegister = async (role: "customer" | "admin" = "customer") => {
    if (!username || !firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setError("")

    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, first_name: firstName, last_name: lastName, email, password, role }),
      })

      if (!res.ok) {
        const data = await res.json()
        const firstError = Object.values(data).flat()[0]
        setError(typeof firstError === 'string' ? firstError : "Registration failed")
        return
      }

      navigate("/login")
    } catch {
      setError("Could not connect to server")
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="login-title">Create Account</h2>

        {error && <p style={{ color: "#ff6b6b", marginBottom: 10 }}>{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button onClick={() => handleRegister("customer")}>Create Account</button>
        
        {/*{isDevMode && (
          <button onClick={() => handleRegister("admin")} style={{ marginTop: 10 }}>
            CREATE ADMIN ACCOUNT (DEV)
          </button>
        )}*/}

        <p style={{ marginTop: 20, color: "rgba(255,255,255,0.7)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#d4af37" }}>Login</Link>
        </p>
      </div>
    </div>
  )
}
