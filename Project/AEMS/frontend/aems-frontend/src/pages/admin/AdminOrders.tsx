import { useEffect, useState } from "react"
import AdminSideBar from "../../components/admin/AdminSideBar"
import "./AdminDashboard.css"
import "./AdminArtworks.css"

type Order = {
  id?: number
  customer: string
  total: number
  status: string
  items?: Array<{ title: string; qty: number; price: number }>
  created_at?: string
  artwork_title?: string
  quantity?: number
  total_price?: number
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
        setOrders(Array.isArray(data) ? data : [])
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
    setOrders((s) => s.map((o) => (o.id === id ? { ...o, status } : o)))
    try {
      await fetch(`${API_BASE}${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
    } catch (err) {
      console.error(err)
      setOrders(prev)
    }
  }

  const orderItems = (order: Order) =>
    order.items?.length
      ? order.items
      : [{ title: order.artwork_title || "Purchased item", qty: order.quantity || 1, price: Number(order.total_price || order.total || 0) }]

  const money = (value?: number) => Number(value || 0).toFixed(2)
  const displayDate = (value?: string) => value ? new Date(value).toLocaleString() : "New order"
  const totalRevenue = filtered.reduce((sum, order) => sum + Number(order.total || order.total_price || 0), 0)
  const shippedCount = filtered.filter((order) => order.status === "Shipped").length

  return (
    <div style={{ display: "flex" }}>
      <AdminSideBar />

      <div className="admin-page">
        <div className="dash-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="admin-title">Orders</h1>
            <p className="muted">Review purchases, update shipping status, and inspect order details in one place.</p>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="orders-grid">
            {filtered.length === 0 && <p className="muted">No orders found yet. Customer purchases will appear here after checkout.</p>}
            {filtered.map((o) => (
              <div key={o.id} className="order-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <div className="art-title">Order #{o.id}</div>
                    <div className="art-artist">{o.customer}</div>
                    <div className="muted tiny">{displayDate(o.created_at)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="art-price">${money(o.total)}</div>
                    <div className="status-badge">{o.status}</div>
                  </div>
                </div>

                <div className="detail-list">
                  {orderItems(o).map((it, index) => (
                    <div key={`${o.id}-${index}`} className="detail-list-item">
                      <span>{it.title}</span>
                      <span className="muted">x{it.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="card-actions">
                  <button className="link" onClick={() => setSelected(o)}>View</button>
                  <button className="link" onClick={() => updateStatus(o.id, o.status === "Shipped" ? "Paid" : "Shipped")}>Toggle Shipped</button>
                  <button className="link danger" onClick={() => handleDelete(o.id)}>Delete</button>
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
                  <p className="muted">{selected.customer} - {displayDate(selected.created_at)}</p>
                </div>
                <button className="close-btn" onClick={() => setSelected(null)}>x</button>
              </div>

              <div className="modal-content">
                <div className="modal-left">
                  <div className="admin-surface" style={{ padding: 14 }}>
                    <strong>Items</strong>
                    <ul className="detail-list" style={{ paddingLeft: 0, marginBottom: 0, listStyle: "none" }}>
                      {orderItems(selected).map((it, i) => (
                        <li key={i} className="detail-list-item">
                          <span>{it.title} x {it.qty}</span>
                          <span>${money(it.price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="modal-right">
                  <div className="detail-row"><span>Total</span><span className="gold">${money(selected.total)}</span></div>
                  <div className="detail-row"><span>Status</span><span className="status-badge">{selected.status}</span></div>
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button className="primary-btn" onClick={() => { updateStatus(selected.id, "Shipped"); setSelected(null) }}>Mark Shipped</button>
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
