import AdminSideBar from "../../components/admin/AdminSideBar"

export default function AdminCustomers() {
  return (
    <div className="dashboard-layout">
      <AdminSideBar />
      <div className="dashboard-content">
        <h2>Customers</h2>
        <p>Manage customers here.</p>
      </div>
    </div>
  )
}
