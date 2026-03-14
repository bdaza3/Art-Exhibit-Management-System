import { useEffect, useState } from "react";
import AdminSideBar from "../../components/admin/AdminSideBar";
import {
  Button,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
const darkInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    transition: "all 0.2s ease",
    "& fieldset": {
      borderColor: "rgba(212,175,55,0.22)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(212,175,55,0.45)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#d4af37",
      boxShadow: "0 0 0 3px rgba(212,175,55,0.10)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.65)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#d4af37",
  },
  "& .MuiInputBase-input": {
    color: "#fff",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "rgba(255,255,255,0.45)",
    opacity: 1,
  },
};
type Exhibition = {
  id: number;
  title: string;
  venue: string;
  location: string;
  date: string;
  description: string;
};

type Stats = {
  total: number;
  upcoming: number;
  past: number;
};

const API_BASE = "http://127.0.0.1:8000/api/auth";

export default function AdminEvents() {
  const [open, setOpen] = useState(false);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, upcoming: 0, past: 0 });

  const [formData, setFormData] = useState({
    title: "",
    venue: "",
    location: "",
    date: "",
    description: "",
  });

  useEffect(() => {
    fetchExhibitions();
    fetchStats();
  }, []);

  const fetchExhibitions = async () => {
    try {
      const res = await fetch(`${API_BASE}/exhibitions/`);
      const data = await res.json();
      setExhibitions(data);
    } catch (error) {
      console.error("Error fetching exhibitions:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/exhibitions/stats/`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: "",
      venue: "",
      location: "",
      date: "",
      description: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.venue || !formData.location || !formData.date) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/exhibitions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Backend validation error:", err);
        alert("Failed to save exhibition.");
        return;
      }

      await fetchExhibitions();
      await fetchStats();
      handleClose();
    } catch (error) {
      console.error("Error saving exhibition:", error);
      alert("Something went wrong while saving.");
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSideBar />

      <div className="dashboard-content">
        <h2>Exhibitions</h2>
        <p>Manage exhibitions here.</p>

        <Container disableGutters>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Exhibition Statistics
          </Typography>

          <Grid container spacing={2} alignItems="stretch">
            <Grid >
              <Card sx={{ minWidth: 180 }}>
                <CardContent>
                  <Typography variant="h5">{stats.total}</Typography>
                  <Typography color="text.secondary">
                    Total Exhibitions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid >
              <Card sx={{ minWidth: 200 }}>
                <CardContent>
                  <Typography variant="h5">{stats.upcoming}</Typography>
                  <Typography color="text.secondary">
                    Upcoming Exhibitions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid >
              <Card sx={{ minWidth: 180 }}>
                <CardContent>
                  <Typography variant="h5">{stats.past}</Typography>
                  <Typography color="text.secondary">
                    Past Exhibitions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid >
              <Button
                variant="contained"
                color="primary"
                sx={{ height: "100%", minHeight: 88, px: 4 }}
                onClick={handleOpen}
              >
                Add New Exhibition
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Exhibition List
            </Typography>

            <Grid container spacing={2}>
              {exhibitions.map((ex) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{ex.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ex.venue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ex.location}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Date: {ex.date}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {ex.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>

       <Dialog
  open={open}
  onClose={handleClose}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      background: "linear-gradient(180deg, rgba(12,12,12,0.96), rgba(18,18,18,0.98))",
      color: "#f5f5f5",
      border: "1px solid rgba(212,175,55,0.28)",
      borderRadius: "22px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
      backdropFilter: "blur(18px)",
      px: 1,
      py: 1,
    },
  }}
>
  <DialogTitle
    sx={{
      fontSize: "28px",
      fontWeight: 700,
      color: "#fff",
      pb: 0.5,
    }}
  >
    Add New Exhibition
  </DialogTitle>

  <DialogContent
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 2.2,
      pt: 2,
    }}
  >
    <Typography
      sx={{
        color: "rgba(255,255,255,0.7)",
        fontSize: "14px",
        mb: 1,
      }}
    >
      Create and publish a new exhibition for customers to discover.
    </Typography>

    <TextField
      label="Exhibition Title"
      name="title"
      value={formData.title}
      onChange={handleChange}
      fullWidth
      required
      variant="outlined"
      sx={darkInputSx}
    />

    <TextField
      label="Venue"
      name="venue"
      value={formData.venue}
      onChange={handleChange}
      fullWidth
      required
      variant="outlined"
      sx={darkInputSx}
    />

    <TextField
      label="Location"
      name="location"
      value={formData.location}
      onChange={handleChange}
      fullWidth
      required
      variant="outlined"
      sx={darkInputSx}
    />

    <TextField
      label="Date"
      name="date"
      type="date"
      value={formData.date}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      fullWidth
      required
      variant="outlined"
      sx={darkInputSx}
    />

    <TextField
      label="Description"
      name="description"
      value={formData.description}
      onChange={handleChange}
      multiline
      rows={4}
      fullWidth
      variant="outlined"
      sx={darkInputSx}
    />
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
    <Button
      onClick={handleClose}
      sx={{
        color: "rgba(255,255,255,0.75)",
        borderRadius: "12px",
        px: 2.5,
        py: 1,
        textTransform: "none",
        fontWeight: 600,
      }}
    >
      Cancel
    </Button>

    <Button
      variant="contained"
      onClick={handleSave}
      sx={{
        background: "linear-gradient(135deg, #d4af37, #b8922f)",
        color: "#111",
        borderRadius: "14px",
        px: 3,
        py: 1.2,
        fontWeight: 700,
        textTransform: "none",
        boxShadow: "0 8px 22px rgba(212,175,55,0.28)",
        "&:hover": {
          background: "linear-gradient(135deg, #e0bc4a, #c49a31)",
          boxShadow: "0 10px 26px rgba(212,175,55,0.38)",
        },
      }}
    >
      Save Exhibition
    </Button>
  </DialogActions>
</Dialog>
      </div>
    </div>
  );
}