import AdminSideBar from "../../components/admin/AdminSideBar"

export default function AdminOrders() {
  return (
    <div className="dashboard-layout">
      <AdminSideBar />
      <div className="dashboard-content">
        <h2>Orders</h2>
        <p>Manage orders here.</p>
      </div>
    </div>
  )
}
