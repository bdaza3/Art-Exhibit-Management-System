import AdminSideBar from "../../components/admin/AdminSideBar"
import { useEffect, useState } from "react"
import "./AdminAuctions.css"

const API_AUCTIONS = "http://127.0.0.1:8000/api/auctions/"
const API_ARTWORKS = "http://127.0.0.1:8000/api/artworks/"

export default function AdminAuctions() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [form, setForm] = useState({ artwork_id: "", starting_bid: 0, min_increment: 1, start_time: "", end_time: "" })

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
      setForm({ artwork_id: "", starting_bid: 0, min_increment: 1, start_time: "", end_time: "" })
    } catch (err) {
      console.error(err)
      alert("Failed to create auction")
    }
  }

  const handleAction = async (id: number, action: string) => {
    try {
      if (action === 'end') {
        await fetch(`${API_AUCTIONS}${id}/end/`, { method: 'POST', credentials: 'include' })
      } else if (action === 'activate') {
        await fetch(`${API_AUCTIONS}${id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status: 'active' }) })
      } else if (action === 'cancel') {
        await fetch(`${API_AUCTIONS}${id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status: 'cancelled' }) })
      }

      const res = await fetch(API_AUCTIONS)
      const d = await res.json()
      setAuctions(d)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="dashboard-layout">
      <AdminSideBar />
      <div className="dashboard-content">
        <h2>Auctions</h2>

        <p>Configure and monitor live auctions. Select an artwork to start an auction, set starting bid, increment, and schedule.</p>

        <form onSubmit={handleCreate} className="auction-form">
          <div className="auction-field">
            <label>Artwork</label>
            <select required className="admin-input" value={form.artwork_id} onChange={(e) => setForm({ ...form, artwork_id: e.target.value })}>
              <option value="">Select artwork</option>
              {artworks.map((a: any) => <option key={a.id} value={a.id}>{a.title} — {a.artist}</option>)}
            </select>
          </div>

          <div className="auction-field">
            <label>Starting bid (USD)</label>
            <input className="admin-input" type="number" step="0.01" placeholder="Starting bid" value={form.starting_bid} onChange={(e) => setForm({ ...form, starting_bid: Number(e.target.value) })} />
          </div>

          <div className="auction-field">
            <label>Min increment (USD)</label>
            <input className="admin-input" type="number" step="0.01" placeholder="Min increment" value={form.min_increment} onChange={(e) => setForm({ ...form, min_increment: Number(e.target.value) })} />
          </div>

          <div className="auction-field">
            <label>Start time</label>
            <input className="admin-input" type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          </div>

          <div className="auction-field">
            <label>End time</label>
            <input className="admin-input" type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>

          <div className="auction-field auction-actions">
            <button type="submit" className="dash-action-btn">Create Auction</button>
          </div>
        </form>

        <h3>Active / Scheduled Auctions</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          {auctions.length === 0 && <p className="muted">No auctions yet.</p>}
          {auctions.map((aq: any) => (
            <div key={aq.id} style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{aq.artwork?.title}</strong>
                  <div className="muted">{aq.artwork?.artist}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>Status: {aq.status}</div>
                  <div>Starting: ${aq.starting_bid}</div>
                  <div>Min +{aq.min_increment}</div>
                </div>
              </div>

              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {aq.status !== 'active' && aq.status !== 'ended' && <button onClick={() => handleAction(aq.id, 'activate')}>Activate</button>}
                {aq.status === 'active' && <button onClick={() => handleAction(aq.id, 'end')}>End Auction</button>}
                {aq.status !== 'ended' && <button onClick={() => handleAction(aq.id, 'cancel')}>Cancel</button>}
              </div>

              <div style={{ marginTop: 8 }}>
                <div className="muted">Bids: {aq.bids?.length || 0}</div>
                {aq.bids && aq.bids.length > 0 && <div>Highest: ${aq.bids[0].amount} by {aq.bids[0].user?.username || 'Anonymous'}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
