import AdminSideBar from "../../components/admin/AdminSideBar"
import {Box, Button, Typography, List, Container, Grid, Divider, Card, CardContent} from "@mui/material"

export default function AdminEvents() {
  return (
    <div className="dashboard-layout">
      <AdminSideBar />
      <div className="dashboard-content">
        <h2>Exhibitions</h2>
        <p>Manage exhibitions here.</p>
        <ExhibitionStats />
      </div>
    </div>
  )
  function ExhibitionStats() {
    // Placeholder for exhibition statistics, such as number of exhibitions, upcoming exhibitions, etc.
    return(
        <Container>
            <Typography variant="h6" gutterBottom>
                Exhibition Statistics
            </Typography>
            <Grid container spacing={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5">10</Typography>
                            <Typography color="textSecondary">Total Exhibitions</Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography variant="h5">3</Typography>
                            <Typography color="textSecondary">Upcoming Exhibitions</Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography variant="h5">7</Typography>
                            <Typography color="textSecondary">Past Exhibitions</Typography>
                        </CardContent>
                    </Card>
                    <Button variant = "contained" color="primary" sx={{ mt: 2 }}>
                        Add New Exhibition
                    </Button>
            </Grid>
        </Container>
    )
  }
}
