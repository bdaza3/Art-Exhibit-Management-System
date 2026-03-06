import AdminSideBar from "../../components/admin/AdminSideBar"
import { Button, Typography, Box } from "@mui/material"

export default function AdminAuctions() {
  return (
    <div className="dashboard-layout">
      <AdminSideBar />
      <div className="dashboard-content">
        <h2>Auctions</h2>

        <Typography variant="body1" gutterBottom>
          Configure and monitor live auctions. Select an artwork to start an auction, set starting bid, increment, and schedule.
        </Typography>

        <Box mt={2}>
          <Button variant="contained" disabled>New Auction (scaffold)</Button>
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle1">Active Auctions</Typography>
          <p>No active auctions yet.</p>
        </Box>
      </div>
    </div>
  )
}
