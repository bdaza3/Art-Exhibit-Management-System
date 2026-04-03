import { useEffect, useState, useRef } from "react";
import AdminSideBar from "../../components/admin/AdminSideBar";
import "./AdminArtworks.css";

const API_BASE = "http://127.0.0.1:8000/api/artworks/";

type Artwork = {
  id?: number;
  title: string;
  artist: string;
  price: number;
  category: string;
  image: string;
  description: string;
  model_3d?: string | null;
};

export default function AdminArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Artwork | null>(null);


  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Artwork | null>(null);

  const [form, setForm] = useState<Artwork>({
    title: "",
    artist: "",
    price: 0,
    category: "",
    image: "",
    description: "",
    model_3d: "",
  });

  
  useEffect(() => {
  fetch(API_BASE)
    .then((res) => res.json())
    .then((data) => {
      console.log("DB DATA:", data); 
      setArtworks(data);             
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, []);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "price"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(f);
  };

  const handleModelFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      // store model as data-url so it can be previewed or sent to backend
      setForm((prev) => ({ ...prev, model_3d: reader.result as string }));
      setModelFile(f);
    };
    reader.readAsDataURL(f);
  };

  async function uploadFileToServer(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const uploadUrl = API_BASE.replace(/artworks\/?$/, 'uploads/');
    const res = await fetch(uploadUrl, { method: 'POST', body: fd, credentials: 'include' });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Upload failed: ${res.status} ${text}`);
    }
    const j = await res.json();
    return j.url;
  }

  const handleSubmit = async (e: any) => {
  e.preventDefault();

  
  if (!form.title || !form.artist || !form.image) {
    alert("Please fill required fields (title, artist, image)");
    return;
  }

  try {
   
    // prepare payload and upload files if provided
    const payload = { ...form } as any;

    if (imageFile) {
      try {
        payload.image = await uploadFileToServer(imageFile);
      } catch (err) {
        console.error('Image upload failed', err);
        alert('Image upload failed: ' + String(err));
        return;
      }
    }

    if (modelFile) {
      try {
        payload.model_3d = await uploadFileToServer(modelFile);
      } catch (err) {
        console.error('Model upload failed', err);
        alert('Model upload failed: ' + String(err));
        return;
      }
    }

    const tempArt = {
      ...payload,
      id: Date.now(), // temporary id
    };

    setArtworks((prev) => [tempArt, ...prev]);

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // attempt to read JSON validation errors or text for diagnostics
      let bodyText = "";
      try {
        const j = await res.json();
        bodyText = JSON.stringify(j);
      } catch (e) {
        bodyText = await res.text().catch(() => "(no body)");
      }
      console.error("Artwork POST failed", res.status, bodyText);
      alert(`Failed to save artwork: ${res.status} ${bodyText}`);
      return;
    }

    const newArt = await res.json();

    
    setArtworks((prev) =>
      prev.map((a) => (a.id === tempArt.id ? newArt : a))
    );

  } catch (err) {
    console.error("POST ERROR:", err);
  }


  setForm({
    title: "",
    artist: "",
    price: 0,
    category: "",
    image: "",
    description: "",
    model_3d: "",
  });
};

  const handleEditChange = (e: any) => {
    if (!editForm) return;

    setEditForm({
      ...editForm,
      [e.target.name]:
        e.target.name === "price"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  
  const handleUpdate = async () => {
    if (!editForm || !editForm.id) return;

    try {
      // if an image file was selected, upload it first and set form.image to returned URL
      if (imageFile) {
        try {
          const url = await uploadFileToServer(imageFile);
          form.image = url;
        } catch (err) {
          console.error('Image upload failed', err);
          alert('Image upload failed: ' + String(err));
          return;
        }
      }

      if (modelFile) {
        try {
          const url = await uploadFileToServer(modelFile);
          form.model_3d = url;
        } catch (err) {
          console.error('Model upload failed', err);
          alert('Model upload failed: ' + String(err));
          return;
        }
      }
      const res = await fetch(`${API_BASE}${editForm.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const updated = await res.json();

      
      setArtworks((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );

      setSelected(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Delete this artwork? This cannot be undone.")) return;

    const prev = artworks;
    setArtworks((a) => a.filter((x) => x.id !== id));

    try {
      await fetch(`${API_BASE}${id}/`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete failed", err);
      setArtworks(prev);
    }
    setSelected(null);
  };

  const categories = Array.from(new Set(artworks.map((a) => a.category).filter(Boolean)));

  const filtered = artworks.filter((a) => {
    const q = query.trim().toLowerCase();
    if (categoryFilter && a.category !== categoryFilter) return false;
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      a.artist.toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex" }}>
      <AdminSideBar />

      <div className="admin-page">
        <h1 className="admin-title">Manage Artworks</h1>
        
        <div className="list-controls">
          <input className="search" placeholder="Search title, artist, description..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        
        <div className="art-form">
          <div className="form-grid">
            <div className="form-preview">
              <div className="preview-box">
                {form.image ? (
                  <img src={form.image} alt="preview" />
                ) : (
                  <div className="preview-empty">Preview</div>
                )}
              </div>

              <div className="preview-actions">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} />
                {/* <small className="muted">Or paste an image URL below</small> */}
              </div>
            </div>

            <div className="form-fields">
              <div className="row">
                <label>Title</label>
                <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
              </div>

              <div className="row two-col">
                <div>
                  <label>Artist</label>
                  <input name="artist" placeholder="Artist" value={form.artist} onChange={handleChange} />
                </div>

                <div>
                  <label>Price (USD)</label>
                  <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
                </div>
              </div>

              <div className="row two-col">
                <div>
                  <label>Category</label>
                  <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
                </div>

                <div>
                  <label>3D Model URL</label>
                  <input name="model_3d" placeholder=".glb URL" value={form.model_3d || ""} onChange={handleChange} />
                  <div style={{ marginTop: 6 }}>
                    <input type="file" accept=".glb,.gltf,model/*" onChange={handleModelFile} />
                    <small className="muted">Or paste a public .glb URL above. Uploaded files become data-URLs.</small>
                  </div>
                </div>
              </div>

              <div className="row">
                <label>Description</label>
                <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
              </div>

              <div className="row actions">
                <button onClick={handleSubmit} className="add-btn">Add Artwork</button>
                <button className="secondary-btn" onClick={() => {
                  setForm({ title: "", artist: "", price: 0, category: "", image: "", description: "", model_3d: "" });
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}>Clear</button>
              </div>
            </div>
          </div>
        </div>

      

        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="art-grid">
            {filtered.map((art) => (
              <div key={art.id || art.title} className="art-card">
                {art.image && <img src={art.image} className="art-image" alt={art.title} />}
                <div className="art-body">
                  <div className="art-title">{art.title}</div>
                  <div className="art-artist">{art.artist}</div>
                  <div className="art-price">${art.price}</div>
                  {art.model_3d && <div className="model-badge">3D</div>}

                  <div className="card-actions">
                    <button className="link" onClick={() => { setSelected(art); setIsEditing(false); }}>View</button>
                    <button className="link" onClick={() => { setSelected(art); setIsEditing(true); setEditForm(art); }}>Edit</button>
                    <button className="link danger" onClick={() => handleDelete(art.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        
        {selected && (
          <div className="modal-backdrop" onClick={() => {
            setSelected(null);
            setIsEditing(false);
          }}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>

              <div className="modal-header">
                <div>
                  <h2>{selected.title}</h2>
                  <p className="muted">{selected.artist}</p>
                </div>

                <button className="close-btn" onClick={() => {
                  setSelected(null);
                  setIsEditing(false);
                }}>
                  ✕
                </button>
              </div>

              <div className="modal-content">
                <div className="modal-left">
                  {selected.image && <img src={selected.image} className="modal-image" />}
                </div>

                
                <div className="modal-right">

                  {!isEditing ? (
                    <>
                      <div className="detail-row">
                        <span>Price</span>
                        <span className="gold">${selected.price}</span>
                      </div>

                      <div className="detail-row">
                        <span>Category</span>
                        <span>{selected.category}</span>
                      </div>

                      <div className="detail-row">
                        <span>Description</span>
                        <span>{selected.description}</span>
                      </div>

                      <button
                        className="primary-btn"
                        onClick={() => {
                          setIsEditing(true);
                          setEditForm(selected);
                        }}
                      >
                        Edit Artwork
                      </button>
                    </>
                  ) : (
                    <>
                      <input name="title" value={editForm?.title || ""} onChange={handleEditChange} />
                      <input name="artist" value={editForm?.artist || ""} onChange={handleEditChange} />
                      <input name="price" type="number" value={editForm?.price || 0} onChange={handleEditChange} />
                      <input name="category" value={editForm?.category || ""} onChange={handleEditChange} />
                      <input name="image" value={editForm?.image || ""} onChange={handleEditChange} />
                      <textarea name="description" value={editForm?.description || ""} onChange={handleEditChange} />

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button className="primary-btn" onClick={handleUpdate}>
                          Save
                        </button>

                        <button
                          className="secondary-btn"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}