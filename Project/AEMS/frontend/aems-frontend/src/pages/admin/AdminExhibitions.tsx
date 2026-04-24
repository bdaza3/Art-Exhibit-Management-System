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
  image?: string;
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
    image: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    setFormData({ id: undefined, title: "", venue: "", location: "", date: "", description: "", image: "" });
    setImageFile(null);
    setImagePreview(null);
    setOpenNew(true);
  };

  const openForEdit = (ex: Exhibition) => {
    setFormData({ id: ex.id, title: ex.title, venue: ex.venue, location: ex.location, date: ex.date, description: ex.description, image: (ex as any).image || "" });
    setImagePreview((ex as any).image || null);
    setOpenEdit(true);
  };

  const closeDialogs = () => {
    setOpenNew(false);
    setOpenEdit(false);
    setFormData({ id: undefined, title: "", venue: "", location: "", date: "", description: "", image: "" });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setFormData((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(f);
  };

  async function uploadFileToServer(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const uploadUrl = API_BASE.replace(/\/?$/, '/') + 'uploads/';
    const res = await fetch(uploadUrl, { method: 'POST', body: fd, credentials: 'include' });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Upload failed: ${res.status} ${text}`);
    }
    const j = await res.json();
    return j.url;
  }

  const handleCreate = async () => {
    if (!formData.title || !formData.venue || !formData.location || !formData.date) {
      alert("Please fill required fields.");
      return;
    }

    try {
      const payload: any = { title: formData.title, venue: formData.venue, location: formData.location, date: formData.date, description: formData.description };
      if (imageFile) {
        try {
          payload.image = await uploadFileToServer(imageFile);
        } catch (err) {
          console.error('Image upload failed', err);
          alert('Image upload failed: ' + String(err));
          return;
        }
      } else if (formData.image) {
        payload.image = formData.image;
      }

      const res = await fetch(`${API_BASE}/exhibitions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      const payload: any = { title: formData.title, venue: formData.venue, location: formData.location, date: formData.date, description: formData.description };
      if (imageFile) {
        try {
          payload.image = await uploadFileToServer(imageFile);
        } catch (err) {
          console.error('Image upload failed', err);
          alert('Image upload failed: ' + String(err));
          return;
        }
      } else if (formData.image) {
        payload.image = formData.image;
      }

      const res = await fetch(`${API_BASE}/exhibitions/${formData.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
            <div className="muted">Create, edit, and organize your events.</div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Button variant="outlined" onClick={() => refresh()} sx={{ textTransform: "none", color: "#fff", transition: 'transform 0.2s', borderColor: "#d4af37", ":hover": { transform: 'scale(1.05)'} }}>Refresh</Button>
            <Button variant="contained" onClick={openCreate} sx={{ bgcolor: "#d4af37", color: "#000", textTransform: "none", transition: 'transform 0.2s', ":hover": { transform: 'scale(1.05)'} }}>New Exhibition</Button>
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
              <Card key={ex.id} sx={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)", overflow: 'hidden' }}>
                { (ex as any).image ? (
                  <div style={{ width: '100%', height: 160, background: `url(${(ex as any).image}) center/cover no-repeat` }} />
                ) : (
                  <div style={{ width: '100%', height: 160, background: '#14171d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.45)' }}>
                    No image
                  </div>
                )}

                <CardContent sx={{ pt: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div>
                      <Typography variant="h6" sx={{ color: '#fff', fontSize: 16 }}>{ex.title}</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{ex.venue} — {ex.location}</Typography>
                      <Typography sx={{ mt: 0.5, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{new Date(ex.date).toLocaleDateString()}</Typography>
                      <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.66)", fontSize: 13, lineHeight: '1.2em', maxHeight: '2.4em', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.description}</Typography>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <Button size="small" onClick={() => openForEdit(ex)} sx={{ textTransform: "none", transition: 'transform 0.2s', ":hover": { transform: 'scale(1.05)'} }}>Edit</Button>
                      <Button size="small" onClick={() => handleDelete(ex.id)} sx={{ color: "#ff6b6b", textTransform: "none", transition: 'transform 0.2s', ":hover": { transform: 'scale(1.05)'} }}>Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
            <div className="muted">Showing {filtered.length} results</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} sx={{ textTransform: "none", transition: 'transform 0.2s', ":hover": { transform: 'scale(1.05)'} }}>Prev</Button>
              <div className="muted">Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / pageSize))}</div>
              <Button disabled={(page + 1) * pageSize >= filtered.length} onClick={() => setPage((p) => p + 1)} sx={{ textTransform: "none", transition: 'transform 0.2s', ":hover": { transform: 'scale(1.05)'} }}>Next</Button>
            </div>
          </div>
        </div>

        {/* New Exhibition Dialog */}
        <Dialog
          open={openNew}
          onClose={closeDialogs}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { background: "#171a22", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2 } }}
        >
          <DialogTitle sx={{ color: "#fff" }}>Add Exhibition</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Title" name="title" value={formData.title} onChange={handleChange} fullWidth sx={darkInputSx} />
            <TextField label="Venue" name="venue" value={formData.venue} onChange={handleChange} fullWidth sx={darkInputSx} />
            <TextField label="Location" name="location" value={formData.location} onChange={handleChange} fullWidth sx={darkInputSx} />
            <TextField label="Date" name="date" type="date" InputLabelProps={{ shrink: true }} value={formData.date} onChange={handleChange} fullWidth sx={darkInputSx} />
            <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} sx={darkInputSx} />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>Exhibition Thumbnail</Typography>
                <input type="file" accept="image/*" onChange={handleFile} />
              </Box>
              {imagePreview ? <img src={imagePreview} style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }} /> : null}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialogs} variant="outlined" sx={{ textTransform: "none", color: "#fff", borderColor: "rgba(212,175,55,0.18)" }}>Cancel</Button>
            <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: "#d4af37", color: "#000", textTransform: "none" }}>Create</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={openEdit}
          onClose={closeDialogs}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { background: "rgba(255,255,255,0.02)", color: "#fff", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 2 } }}
        >
          <DialogTitle sx={{ color: "#fff" }}>Edit Exhibition</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Title" name="title" value={formData.title} onChange={handleChange} fullWidth sx={darkInputSx} />
            <TextField label="Venue" name="venue" value={formData.venue} onChange={handleChange} fullWidth sx={darkInputSx} />
            <TextField label="Location" name="location" value={formData.location} onChange={handleChange} fullWidth sx={darkInputSx} />
            <TextField label="Date" name="date" type="date" InputLabelProps={{ shrink: true }} value={formData.date} onChange={handleChange} fullWidth sx={darkInputSx} />
            <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} sx={darkInputSx} />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <input type="file" accept="image/*" onChange={handleFile} />
              {imagePreview ? <img src={imagePreview} style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }} /> : null}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialogs} variant="outlined" sx={{ textTransform: "none", color: "#fff", borderColor: "rgba(212,175,55,0.18)" }}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdate} sx={{ bgcolor: "#d4af37", color: "#000", textTransform: "none" }}>Save</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
