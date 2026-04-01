import { useEffect, useState } from "react";
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

  const handleSubmit = async (e: any) => {
  e.preventDefault();

  
  if (!form.title || !form.artist || !form.image) {
    alert("Please fill required fields (title, artist, image)");
    return;
  }

  try {
   
    const tempArt = {
      ...form,
      id: Date.now(), // temporary id
    };

    setArtworks((prev) => [tempArt, ...prev]);

    
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    
    if (!res.ok) {
      console.warn("Backend save failed, UI still updated");
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

  return (
    <div style={{ display: "flex" }}>
      <AdminSideBar />

      <div className="admin-page">
        <h1 className="admin-title">Manage Artworks</h1>

        
        <form className="art-form" onSubmit={handleSubmit}>
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
          <input name="artist" placeholder="Artist" value={form.artist} onChange={handleChange} />
          <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
          <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
          <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />
          <input name="model_3d" placeholder="3D Model URL (.glb)" value={form.model_3d || ""} onChange={handleChange} />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

          <button type="submit" className="add-btn">
              Add Artwork
          </button>
        </form>

        
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="art-grid">
            {artworks.map((art, i) => (
              <div key={i} className="art-card" onClick={() => setSelected(art)}>
                {art.image && <img src={art.image} className="art-image" />}
                <div className="art-body">
                  <div className="art-title">{art.title}</div>
                  <div className="art-artist">{art.artist}</div>
                  <div className="art-price">${art.price}</div>
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