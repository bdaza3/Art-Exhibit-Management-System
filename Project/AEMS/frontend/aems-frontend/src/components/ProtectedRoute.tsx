import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  role?: string
}

export default function ProtectedRoute({ children, role }: Props) {

  const user = JSON.parse(localStorage.getItem("user") || "{}")

  if (!user.role) return <Navigate to="/login" />

  if (role && user.role !== role)
    return <Navigate to="/login" />

  return <>{children}</>
}
