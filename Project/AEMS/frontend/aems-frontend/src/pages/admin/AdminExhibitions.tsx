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
import "./AdminDashboard.css";
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

const API_BASE = "http://127.0.0.1:8000/api";

export default function AdminExhibitions() {
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, upcoming: 0, past: 0 });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(6);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    title: "",
    venue: "",
    location: "",
    date: "",
    description: "",
  });

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    await Promise.all([fetchExhibitions(), fetchStats()]);
    setLoading(false);
  };

  const fetchExhibitions = async () => {
    try {
      const res = await fetch(`${API_BASE}/exhibitions/`);
      const data = await res.json();
      setExhibitions(Array.isArray(data) ? data : []);
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

  const openCreate = () => {
    setFormData({ id: undefined, title: "", venue: "", location: "", date: "", description: "" });
    setOpenNew(true);
  };

  const openForEdit = (ex: Exhibition) => {
    setFormData({ id: ex.id, title: ex.title, venue: ex.venue, location: ex.location, date: ex.date, description: ex.description });
    setOpenEdit(true);
  };

  const closeDialogs = () => {
    setOpenNew(false);
    setOpenEdit(false);
    setFormData({ id: undefined, title: "", venue: "", location: "", date: "", description: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.venue || !formData.location || !formData.date) {
      alert("Please fill required fields.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/exhibitions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title, venue: formData.venue, location: formData.location, date: formData.date, description: formData.description }),
      });
      if (!res.ok) throw new Error("Failed to create");
      await refresh();
      closeDialogs();
    } catch (err) {
      console.error(err);
      alert("Save failed.");
    }
  };

  const handleUpdate = async () => {
    if (!formData.id) return;
    try {
      const res = await fetch(`${API_BASE}/exhibitions/${formData.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title, venue: formData.venue, location: formData.location, date: formData.date, description: formData.description }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await refresh();
      closeDialogs();
    } catch (err) {
      console.error(err);
      alert("Update failed.");
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Delete this exhibition?")) return;
    try {
      const res = await fetch(`${API_BASE}/exhibitions/${id}/`, { method: "DELETE" });
      if (res.ok) await refresh(); else throw new Error("Delete failed");
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  };

  const filtered = exhibitions.filter((e) => {
    if (filter === "upcoming" && new Date(e.date) < new Date()) return false;
    if (filter === "past" && new Date(e.date) >= new Date()) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (e.title || "").toLowerCase().includes(q) || (e.venue || "").toLowerCase().includes(q) || (e.location || "").toLowerCase().includes(q);
  });

  const paged = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div style={{ display: "flex" }}>
      <AdminSideBar />

      <div className="admin-page">
        <div className="dash-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Exhibitions</h2>
            <div className="muted">Manage exhibitions — create, edit, and organize events.</div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Button variant="outlined" onClick={() => refresh()} sx={{ textTransform: "none" }}>Refresh</Button>
            <Button variant="contained" onClick={openCreate} sx={{ bgcolor: "#d4af37", color: "#000", textTransform: "none" }}>New Exhibition</Button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 18, alignItems: "center" }}>
          <TextField placeholder="Search title, venue or location" size="small" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} sx={{ width: 420 }} />
          <select value={filter} onChange={(e) => { setFilter(e.target.value as any); setPage(0); }} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.04)", color: "#fff", border: "1px solid rgba(212,175,55,0.18)" }}>
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {paged.map((ex) => (
              <Card key={ex.id} sx={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}>
                <CardContent>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <Typography variant="h6">{ex.title}</Typography>
                      <Typography color="text.secondary">{ex.venue} — {ex.location}</Typography>
                      <Typography sx={{ mt: 1 }}>{new Date(ex.date).toLocaleDateString()}</Typography>
                      <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}>{ex.description}</Typography>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 12 }}>
                      <Button size="small" onClick={() => openForEdit(ex)} sx={{ textTransform: "none" }}>Edit</Button>
                      <Button size="small" onClick={() => handleDelete(ex.id)} sx={{ color: "#ff6b6b", textTransform: "none" }}>Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
            <div className="muted">Showing {filtered.length} results</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} sx={{ textTransform: "none" }}>Prev</Button>
              <div className="muted">Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / pageSize))}</div>
              <Button disabled={(page + 1) * pageSize >= filtered.length} onClick={() => setPage((p) => p + 1)} sx={{ textTransform: "none" }}>Next</Button>
            </div>
          </div>
        </div>

        {/* New Exhibition Dialog */}
        <Dialog open={openNew} onClose={closeDialogs} fullWidth maxWidth="sm">
          <DialogTitle>Add Exhibition</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Title" name="title" value={formData.title} onChange={handleChange} fullWidth />
            <TextField label="Venue" name="venue" value={formData.venue} onChange={handleChange} fullWidth />
            <TextField label="Location" name="location" value={formData.location} onChange={handleChange} fullWidth />
            <TextField label="Date" name="date" type="date" InputLabelProps={{ shrink: true }} value={formData.date} onChange={handleChange} fullWidth />
            <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialogs}>Cancel</Button>
            <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: "#d4af37", color: "#000" }}>Create</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={openEdit} onClose={closeDialogs} fullWidth maxWidth="sm">
          <DialogTitle>Edit Exhibition</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Title" name="title" value={formData.title} onChange={handleChange} fullWidth />
            <TextField label="Venue" name="venue" value={formData.venue} onChange={handleChange} fullWidth />
            <TextField label="Location" name="location" value={formData.location} onChange={handleChange} fullWidth />
            <TextField label="Date" name="date" type="date" InputLabelProps={{ shrink: true }} value={formData.date} onChange={handleChange} fullWidth />
            <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialogs}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdate} sx={{ bgcolor: "#d4af37", color: "#000" }}>Save</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}