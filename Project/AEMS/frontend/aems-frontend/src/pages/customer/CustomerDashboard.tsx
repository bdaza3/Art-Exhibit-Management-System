import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./CustomerDashboard.css"
import "../ViewBuyArtPage.css"
import SideBar from "../../components/SideBar"
import ArtViewer3D from "../../components/customer/3DArtworkViewer"
import { ARTWORKS, addToCart, formatMoney } from "../../components/artData"
import type { Artwork } from "../../components/artData"


export default function CustomerDashboard() {
  const navigate = useNavigate()
  const username = localStorage.getItem("username")
  const parallaxRef = useRef<HTMLDivElement>(null)
  const homeRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState("/customer")

  /* --- parallax scroll effect --- */
  useEffect(() => {
    const layer = parallaxRef.current
    if (!layer) return
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          layer.style.transform = `translate3d(0, ${window.scrollY * -0.35}px, 0)`
          ticking = false
        })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* --- scroll-aware sidebar highlight --- */
  useEffect(() => {
    const el = artRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setActiveSection(entry.isIntersecting ? "/customer/art" : "/customer")
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const logout = () => {
    localStorage.clear()
    navigate("/")
  }

  const [show3DTest, setShow3DTest] = useState(false)
  const TEST_MODEL = "/models/low-poly_tesla_cybertruck.glb"

  function scrollToHome() {
    homeRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  function scrollToArt() {
    artRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  /* --- art state --- */
  const [query, setQuery] = useState("")
  const [artist, setArtist] = useState("All")
  const [sort, setSort] = useState<"newest" | "priceLow" | "priceHigh">("newest")
  const [selected, setSelected] = useState<Artwork | null>(null)
  const [toast, setToast] = useState("")

  const artists = useMemo(() => {
    const unique = Array.from(new Set(ARTWORKS.map((a) => a.artist)))
    return ["All", ...unique]
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = ARTWORKS.filter((a) => {
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.artist.toLowerCase().includes(q) ||
        a.medium.toLowerCase().includes(q)
      const matchesArtist = artist === "All" || a.artist === artist
      return matchesQuery && matchesArtist
    })
    if (sort === "newest") list = list.sort((a, b) => (a.dateCreated < b.dateCreated ? 1 : -1))
    else if (sort === "priceLow") list = list.sort((a, b) => a.price - b.price)
    else if (sort === "priceHigh") list = list.sort((a, b) => b.price - a.price)
    return list
  }, [query, artist, sort])

  function onAdd(art: Artwork) {
    addToCart(art)
    setToast(`Added "${art.title}" to cart`)
    window.setTimeout(() => setToast(""), 1200)
  }

  return (
    <div className="dashboard-layout">
      <SideBar activeOverride={activeSection} onArtClick={scrollToArt} onHomeClick={scrollToHome} />

      {/* Parallax abstract shapes */}
      <div className="parallax-shapes" ref={parallaxRef}>
        <svg className="shape shape-1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="2" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="1.5" />
        </svg>
        <svg className="shape shape-2" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,10 190,150 10,150" fill="none" stroke="rgba(128,0,128,0.10)" strokeWidth="1.5" />
        </svg>
        <svg className="shape shape-3" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="150" x2="300" y2="50" stroke="rgba(212,175,55,0.08)" strokeWidth="1" />
          <line x1="50" y1="0" x2="250" y2="300" stroke="rgba(75,0,130,0.07)" strokeWidth="1" />
          <line x1="0" y1="50" x2="300" y2="200" stroke="rgba(0,128,128,0.06)" strokeWidth="1" />
        </svg>
        <svg className="shape shape-4" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="30" width="140" height="140" rx="20" fill="none" stroke="rgba(212,175,55,0.09)" strokeWidth="1.5" transform="rotate(25 100 100)" />
        </svg>
        <svg className="shape shape-5" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="100" cy="100" rx="90" ry="50" fill="none" stroke="rgba(0,80,180,0.08)" strokeWidth="1.5" transform="rotate(-15 100 100)" />
        </svg>
        <svg className="shape shape-6" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,100 Q100,10 180,100 Q100,190 20,100" fill="none" stroke="rgba(212,175,55,0.07)" strokeWidth="1.5" />
        </svg>
        <svg className="shape shape-7" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="100" x2="300" y2="30" stroke="rgba(128,0,128,0.06)" strokeWidth="1" />
          <line x1="30" y1="0" x2="270" y2="200" stroke="rgba(212,175,55,0.05)" strokeWidth="1" />
        </svg>
        <div className="shape-dot dot-1" />
        <div className="shape-dot dot-2" />
        <div className="shape-dot dot-3" />
        <div className="shape-dot dot-4" />
        <div className="shape-dot dot-5" />
      </div>

      <div className="dashboard-content">

        {/* HERO HEADER */}
        <div ref={homeRef} className="dash-header">
          <h2>Welcome back, {username} 🎨</h2>
          <button onClick={logout}>Logout</button>
        </div>

        {/* CARDS */}
        <div className="cards">

          <div
            className="card"
            onClick={scrollToArt}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") scrollToArt();
            }}
            style={{
            backgroundImage:
                  "url(https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070)",
            }}
           >
            <h3>View / Buy Arts ▼</h3>
            <p>Explore and purchase artworks</p>
          </div>

          <div
            className="card"
            onClick={() => navigate("/customer/events")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/customer/events");
            }}
            style={{
              backgroundImage:
                "url(https://i.pinimg.com/736x/d4/e8/d1/d4e8d131a4465dd871963242f5b8770b.jpg)"
            }}
          >
            <h3>Upcoming Events</h3>
            <p>See future exhibitions</p>
          </div>

          <div
            className="card"
            onClick={() => navigate("/customer/tickets")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/customer/tickets")
            }}
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=2070)"
            }}
          >
            <h3>Buy Tickets</h3>
            <p>Reserve exhibition tickets</p>
          </div>

          <div
            className="card"
            onClick={() => navigate("/customer/payments")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/customer/payments")
            }}
            style={{
              backgroundImage: 
                "url(https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=2070)"
            }}
          >
            <h3>Make Payments</h3>
            <p>Secure online payments</p>
          </div>

        </div>

        {/* ═══════ ART SECTION ═══════ */}
        <div ref={artRef} className="dashboard-art-section">
          <div className="art-hero">
            <div>
              <h2>View / Buy Art</h2>            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setShow3DTest(true)}>Open 3D Test</button>
            </div>
              <p className="muted">Explore curated works by artists. Click any piece for full details.</p>
            </div>
            <div className="controls">
              <input
                className="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, artist, medium…"
              />
              <select value={artist} onChange={(e) => setArtist(e.target.value)}>
                {artists.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
                <option value="newest">Sort: Newest</option>
                <option value="priceLow">Sort: Price (Low → High)</option>
                <option value="priceHigh">Sort: Price (High → Low)</option>
              </select>
            </div>
          </div>

          <div className="art-grid">
            {filtered.map((art) => (
              <button key={art.id} className="art-card" onClick={() => setSelected(art)} type="button">
                <div className="art-image" style={{ backgroundImage: `url(${art.image})` }} />
                <div className="art-card-body">
                  <div className="art-title-row">
                    <div className="art-title">{art.title}</div>
                    <div className="art-price">{formatMoney(art.price)}</div>
                  </div>
                  <div className="art-artist muted">{art.artist}</div>
                  <div className="art-meta muted">{art.medium}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Art Modal */}
        {selected && (
          <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modal-top">
                <div>
                  <div className="modal-title">{selected.title}</div>
                  <div className="muted">{selected.artist}</div>
                </div>
                <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close">✕</button>
              </div>
              <div className="modal-content">
                <div className="modal-image" style={{ backgroundImage: `url(${selected.image})` }} />
                <div className="modal-details">
                  <div className="detail-row"><span className="label">Price</span><span className="value gold">{formatMoney(selected.price)}</span></div>
                  <div className="detail-row"><span className="label">Created</span><span className="value">{selected.dateCreated}</span></div>
                  <div className="detail-row"><span className="label">Medium</span><span className="value">{selected.medium}</span></div>
                  <div className="detail-row"><span className="label">Dimensions</span><span className="value">{selected.dimensions}</span></div>
                  <div className="block"><div className="block-title">Purpose</div><div className="block-text muted">{selected.purpose}</div></div>
                  <div className="block"><div className="block-title">Description</div><div className="block-text muted">{selected.description}</div></div>
                  <div className="block">
                    <div className="block-title">Museums Exhibited</div>
                    <ul className="museum-list">
                      {selected.museumsExhibited.map((m) => (<li key={m} className="muted">{m}</li>))}
                    </ul>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-primary" onClick={() => onAdd(selected)}>Add to cart</button>
                    <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}

        {/*3d test modal*/}
        {show3DTest && (
          <div className="modal-backdrop" onMouseDown={() => setShow3DTest(false)}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modal-top">
                <div>
                  <div className="modal-title">3D Viewer Test</div>
                  <div className="muted">Model: low-poly_tesla_cybertruck.glb</div>
                </div>
                <button className="icon-btn" onClick={() => setShow3DTest(false)} aria-label="Close">✕</button>
              </div>
              <div className="modal-content" style={{ gridTemplateColumns: '1fr' }}>
                <div className="viewer-wrap" style={{ width: '100%', height: 520 }}>
                  <ArtViewer3D modelUrl={TEST_MODEL} height={520} />
                </div>
              </div>
            </div>
          </div>
        )}
        {/*end of test*/}
      </div>
    </div>
  )
}
