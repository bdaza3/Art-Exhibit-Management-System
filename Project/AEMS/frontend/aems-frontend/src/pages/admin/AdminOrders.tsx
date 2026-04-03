import { useEffect, useState } from "react"
import AdminSideBar from "../../components/admin/AdminSideBar"
import "./AdminArtworks.css"

type Order = {
  id?: number
  customer: string
  total: number
  status: string
  items?: Array<{ title: string; qty: number; price: number }>
  created_at?: string
}

const API_BASE = "http://127.0.0.1:8000/api/orders/"

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => {
    fetch(API_BASE)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const statuses = Array.from(new Set(orders.map((o) => o.status).filter(Boolean)))

  const filtered = orders.filter((o) => {
    const q = query.trim().toLowerCase()
    if (statusFilter && o.status !== statusFilter) return false
    if (!q) return true
    return (
      o.customer.toLowerCase().includes(q) ||
      (o.items || []).some((i) => i.title.toLowerCase().includes(q))
    )
  })

  const handleDelete = async (id?: number) => {
    if (!id) return
    if (!confirm("Delete this order?")) return
    const prev = orders
    setOrders((s) => s.filter((o) => o.id !== id))
    try {
      await fetch(`${API_BASE}${id}/`, { method: "DELETE" })
    } catch (err) {
      console.error(err)
      setOrders(prev)
    }
  }

  const updateStatus = async (id?: number, status?: string) => {
    if (!id || !status) return
    const prev = orders
    setOrders((s) => s.map((o) => (o.id === id ? { ...o, status: status } : o)))
    try {
      await fetch(`${API_BASE}${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
    } catch (err) {
      console.error(err)
      setOrders(prev)
    }
  }

  return (
    <div style={{ display: "flex" }}>
      <AdminSideBar />

      <div className="admin-page">
        <h1 className="admin-title">Manage Orders</h1>

        <div className="list-controls">
          <input className="search" placeholder="Search customer or item..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="art-grid">
            {filtered.map((o) => (
              <div key={o.id} className="art-card">
                <div style={{ padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="art-title">Order #{o.id}</div>
                      <div className="art-artist">{o.customer}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="art-price">${o.total.toFixed(2)}</div>
                      <div className="model-badge">{o.status}</div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="link" onClick={() => setSelected(o)}>View</button>
                    <button className="link" onClick={() => updateStatus(o.id, o.status === "shipped" ? "processing" : "shipped")}>Toggle Shipped</button>
                    <button className="link danger" onClick={() => handleDelete(o.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="modal-backdrop" onClick={() => setSelected(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Order #{selected.id}</h2>
                  <p className="muted">{selected.customer} • {selected.created_at}</p>
                </div>
                <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
              </div>

              <div className="modal-content">
                <div className="modal-left">
                  <div style={{ padding: 10 }}>
                    <strong>Items</strong>
                    <ul>
                      {selected.items?.map((it, i) => (
                        <li key={i}>{it.title} × {it.qty} — ${it.price.toFixed(2)}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="modal-right">
                  <div className="detail-row"><span>Total</span><span className="gold">${selected.total.toFixed(2)}</span></div>
                  <div className="detail-row"><span>Status</span><span>{selected.status}</span></div>
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button className="primary-btn" onClick={() => { updateStatus(selected.id, "shipped"); setSelected(null); }}>Mark Shipped</button>
                    <button className="secondary-btn" onClick={() => setSelected(null)}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
