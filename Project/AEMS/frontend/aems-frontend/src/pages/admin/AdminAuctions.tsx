import AdminSideBar from "../../components/admin/AdminSideBar"
import { useEffect, useState } from "react"
import "./AdminDashboard.css"
import "./AdminArtworks.css"
import "./AdminAuctions.css"

const API_AUCTIONS = "http://127.0.0.1:8000/api/auctions/"
const API_ARTWORKS = "http://127.0.0.1:8000/api/artworks/"

export default function AdminAuctions() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [form, setForm] = useState({ artwork_id: "", starting_bid: "", min_increment: "", start_time: "", end_time: "" })

  useEffect(() => {
    fetch(API_ARTWORKS)
      .then((r) => r.json())
      .then((d) => setArtworks(d))
      .catch(() => {})

    fetch(API_AUCTIONS)
      .then((r) => r.json())
      .then((d) => setAuctions(d))
      .catch(() => {})
  }, [])

  const handleCreate = async (e: any) => {
    e.preventDefault()
    try {
      const payload = {
        artwork_id: Number(form.artwork_id),
        starting_bid: Number(form.starting_bid),
        min_increment: Number(form.min_increment),
        start_time: form.start_time,
        end_time: form.end_time,
      }

      const res = await fetch(API_AUCTIONS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Failed to create")
      const created = await res.json()
      setAuctions((p) => [created, ...p])
      setForm({ artwork_id: "", starting_bid: "", min_increment: "", start_time: "", end_time: "" })
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error(err)
      alert("Failed to create auction")
    }
  }

  const handleAction = async (id: number, action: string) => {
    try {
      if (action === "end") {
        await fetch(`${API_AUCTIONS}${id}/end/`, { method: "POST", credentials: "include" })
      } else if (action === "activate") {
        await fetch(`${API_AUCTIONS}${id}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status: "active" }) })
      } else if (action === "cancel") {
        await fetch(`${API_AUCTIONS}${id}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status: "cancelled" }) })
      }

      const res = await fetch(API_AUCTIONS)
      const d = await res.json()
      setAuctions(d)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ display: "flex" }}>
      <AdminSideBar />
      <div className="admin-page">
        <div className="dash-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Auctions</h2>
            <div className="muted">Launch, monitor, and control live bidding.</div>
          </div>
          <button className="dash-action-btn" type="button" onClick={() => setIsCreateModalOpen(true)}>
            Create Auction
          </button>
        </div>

        {isCreateModalOpen && (
          <div className="auction-modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
            <div className="auction-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-surface-header">
                <div>
                  <h2 className="admin-surface-title">Create Auction</h2>
                  <div className="section-note">Select an artwork, define bidding rules, then schedule the start and end time.</div>
                </div>
                <button className="ghost-btn" type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Close
                </button>
              </div>

              <form onSubmit={handleCreate} className="auction-form">
                <div className="auction-field auction-field-wide">
                  <label>Artwork</label>
                  <select required className="admin-input" value={form.artwork_id} onChange={(e) => setForm({ ...form, artwork_id: e.target.value })}>
                    <option value="">Select artwork</option>
                    {artworks.map((a: any) => <option key={a.id} value={a.id}>{a.title} - {a.artist}</option>)}
                  </select>
                </div>

                <div className="auction-form-grid">
                  <div className="auction-field">
                    <label>Starting bid (USD)</label>
                    <input className="admin-input" type="text" inputMode="decimal" placeholder="Starting bid" value={form.starting_bid} onChange={(e) => setForm({ ...form, starting_bid: e.target.value })} />
                  </div>

                  <div className="auction-field">
                    <label>Min increment (USD)</label>
                    <input className="admin-input" type="text" inputMode="decimal" placeholder="Min increment" value={form.min_increment} onChange={(e) => setForm({ ...form, min_increment: e.target.value })} />
                  </div>

                  <div className="auction-field">
                    <label>Start time</label>
                    <input className="admin-input" type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                  </div>

                  <div className="auction-field">
                    <label>End time</label>
                    <input className="admin-input" type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                  </div>
                </div>

                <div className="auction-actions auction-form-actions">
                  <button type="submit" className="dash-action-btn">Create Auction</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="admin-surface">
          <div className="admin-surface-header">
            <div>
              <h2 className="admin-surface-title">Active / Scheduled Auctions</h2>
              <div className="section-note">Manage auction state and review bidding activity without leaving the list.</div>
            </div>
          </div>

          <div className="auction-list">
            {auctions.length === 0 && <p className="muted">No auctions yet.</p>}
            {auctions.map((aq: any) => (
              <div key={aq.id} className="auction-card">
                <div className="auction-card-top">
                  <div>
                    <strong>{aq.artwork?.title}</strong>
                    <div className="muted">{aq.artwork?.artist}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="status-badge">{aq.status}</div>
                  </div>
                </div>

                <div className="auction-meta">
                  <div className="auction-meta-tile">
                    <div className="auction-meta-label">Starting Bid</div>
                    <div className="auction-meta-value">${aq.starting_bid}</div>
                  </div>
                  <div className="auction-meta-tile">
                    <div className="auction-meta-label">Min Increment</div>
                    <div className="auction-meta-value">+${aq.min_increment}</div>
                  </div>
                  <div className="auction-meta-tile">
                    <div className="auction-meta-label">Bids</div>
                    <div className="auction-meta-value">{aq.bids?.length || 0}</div>
                  </div>
                  <div className="auction-meta-tile">
                    <div className="auction-meta-label">Highest Bid</div>
                    <div className="auction-meta-value">{aq.bids && aq.bids.length > 0 ? `$${aq.bids[0].amount}` : "None yet"}</div>
                  </div>
                </div>

                <div className="auction-actions-row">
                  {aq.status !== "active" && aq.status !== "ended" && <button className="ghost-btn" onClick={() => handleAction(aq.id, "activate")}>Activate</button>}
                  {aq.status === "active" && <button className="ghost-btn" onClick={() => handleAction(aq.id, "end")}>End Auction</button>}
                  {aq.status !== "ended" && <button className="ghost-btn" onClick={() => handleAction(aq.id, "cancel")}>Cancel</button>}
                </div>

                <div style={{ marginTop: 12 }} className="muted">
                  {aq.bids && aq.bids.length > 0 ? `Highest bidder: ${aq.bids[0].user?.username || "Anonymous"}` : "No bids yet."}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
