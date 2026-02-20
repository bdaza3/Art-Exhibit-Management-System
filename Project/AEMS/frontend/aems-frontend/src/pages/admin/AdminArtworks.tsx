import AdminSideBar from "../../components/admin/AdminSideBar"

export default function AdminArts() {
  return (
    <div className="dashboard-layout">
      <AdminSideBar />
      <div className="dashboard-content">
        <h2>Artworks</h2>
        <p>Manage artworks here.</p>
      </div>
    </div>
  )
}
