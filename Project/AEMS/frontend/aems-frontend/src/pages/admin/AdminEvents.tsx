import AdminSideBar from "../../components/admin/AdminSideBar"

export default function AdminEvents() {
  return (
    <div className="dashboard-layout">
      <AdminSideBar />
      <div className="dashboard-content">
        <h2>Exhibitions</h2>
        <p>Manage exhibitions here.</p>
      </div>
    </div>
  )
}
