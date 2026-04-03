
// import type { Artwork } from "../../components/artData";
import { useEffect, useMemo, useRef, useState } from "react";
import "./ViewBuyArtPage.css";
import PageTopBar from "../../components/PageTopBar";
import SideBar from "../../components/customer/SideBar";
import ArtViewer3D from "../../components/customer/3DArtworkViewer";
import { addToCart, formatMoney } from "../../components/artData";





const API_BASE = "http://127.0.0.1:8000/api/artworks/";

type Artwork = {
  id: number;
  title: string;
  artist: string;
  price: number;
  category: string;
  image: string;
  description: string;
  model_3d?: string | null;
};

export default function ViewBuyArtPage() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("All");
  const [sort, setSort] = useState<"newest" | "priceLow" | "priceHigh">("newest");

  const [selected, setSelected] = useState<any | null>(null);
  const [toast, setToast] = useState("");
  const [show3D, setShow3D] = useState(false);
  const [auctions, setAuctions] = useState<any[]>([])
  const [bidAmount, setBidAmount] = useState(0)
  const [bidAnon, setBidAnon] = useState(false)

  // ✅ FETCH FROM DJANGO DB
  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/artworks/");

        if (!res.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await res.json();
        console.log("DATA:", data);

        // ✅ MAP BACKEND → FRONTEND STRUCTURE
        const mapped = data.map((item: Artwork) => ({
          id: item.id,
          title: item.title || "Untitled",
          artist: item.artist || "Unknown",
          price: item.price ?? 500,
          category: item.category || "Collection Piece",
          description: item.description || "",
          image: item.image || "",
          modelUrl: item.model_3d || null,
        }));

        setArtworks(mapped);
      } catch (err) {
        console.error("ERROR:", err);
        setLoadError("Failed to load artworks");
      } finally {
        setIsLoading(false);
      }
    };

    loadArtworks();
    // fetch auctions
    (async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/auctions/")
        const data = await res.json()
        setAuctions(data)
      } catch { }
    })()
  }, []);

  // ✅ FILTER ARTISTS
  const artists = useMemo(() => {
    const unique = Array.from(new Set(artworks.map((a) => a.artist)));
    return ["All", ...unique];
  }, [artworks]);

  // ✅ FILTER + SEARCH + SORT
  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    let list = artworks.filter((a) => {
      const matchesQuery =
        a.title.toLowerCase().includes(q) ||
        a.artist.toLowerCase().includes(q) ||
        (a.category || "").toLowerCase().includes(q); // ✅ SAFE

      const matchesArtist = artist === "All" || a.artist === artist;

      return matchesQuery && matchesArtist;
    });

    if (sort === "priceLow") list.sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") list.sort((a, b) => b.price - a.price);

    return list;
  }, [artworks, query, artist, sort]);

  // 🛒 ADD TO CART
  function onAdd(art: any) {
    addToCart(art);
    setToast(`Added "${art.title}"`);
    setTimeout(() => setToast(""), 1200);
  }

  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: "flex" }}>
      <SideBar />

      <div className="art-page">
        <PageTopBar title="View / Buy Arts" />

  
        <div className="art-hero">
          <h2>Explore Art</h2>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="search"
          />

          <select value={artist} onChange={(e) => setArtist(e.target.value)}>
            {artists.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="newest">Newest</option>
            <option value="priceLow">Price Low → High</option>
            <option value="priceHigh">Price High → Low</option>
          </select>
        </div>

     
        {isLoading && <p>Loading artworks...</p>}
        {loadError && <p>{loadError}</p>}


        <div className="art-grid" ref={gridRef}>
          {filtered.map((art) => (
            <div
              key={art.id}
              className="art-card"
              onClick={() => setSelected(art)}
            >
              <div
                className="art-image"
                style={{ backgroundImage: `url(${art.image})` }}
              />
              <h3>{art.title}</h3>
              <p>{art.artist}</p>
              <p className="gold">${art.price}</p>
            </div>
          ))}
        </div>

       
        {selected && (
          <div className="modal-backdrop" onClick={() => setSelected(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-left">
                  <div
                    className="modal-image"
                    style={{ backgroundImage: `url(${selected.image})` }}
                  />

                  {selected.modelUrl && (
                    <button onClick={() => setShow3D(!show3D)}>
                      {show3D ? "Hide 3D" : "View 3D"}
                    </button>
                  )}

                  {show3D && selected.modelUrl && (
                    <ArtViewer3D modelUrl={selected.modelUrl} height={400} />
                  )}
                </div>

                <div className="modal-right">
                  <h2>{selected.title}</h2>
                  <p>{selected.artist}</p>
                  <p>{selected.description}</p>

                  {/* Auction area */}
                  {(() => {
                    const auction = auctions.find((a) => a.artwork?.id === selected.id && a.status !== 'ended' && a.status !== 'cancelled')
                    if (!auction) return null

                    const highest = auction.bids && auction.bids.length ? auction.bids[0].amount : auction.starting_bid

                    return (
                      <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
                        <h4>Auction</h4>
                        <div>Status: {auction.status}</div>
                        <div>Current Highest: ${highest}</div>
                        <div>Minimum Increment: ${auction.min_increment}</div>

                        <div style={{ marginTop: 8 }}>
                          <input type="number" step="0.01" value={bidAmount} onChange={(e) => setBidAmount(Number(e.target.value))} placeholder={`Min: ${Number(highest) + Number(auction.min_increment)}`} />
                          <label style={{ marginLeft: 8 }}><input type="checkbox" checked={bidAnon} onChange={(e) => setBidAnon(e.target.checked)} /> Anonymous</label>
                          <button onClick={async () => {
                            try {
                              const res = await fetch(`http://127.0.0.1:8000/api/auctions/${auction.id}/place_bid/`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ amount: bidAmount, anonymous: bidAnon })
                              })

                              if (!res.ok) {
                                const err = await res.json()
                                alert(err.error || 'Bid failed')
                                return
                              }

                              const b = await res.json()
                              setToast('Bid placed')
                              setTimeout(() => setToast(''), 1500)
                              // refresh auctions
                              const ares = await fetch('http://127.0.0.1:8000/api/auctions/')
                              const adata = await ares.json()
                              setAuctions(adata)
                            } catch (err) {
                              console.error(err)
                              alert('Bid failed')
                            }
                          }}>Place Bid</button>
                        </div>

                        <div style={{ marginTop: 8 }}>
                          <h5>Bid History</h5>
                          <div className="muted">(most recent first)</div>
                          <ul>
                            {auction.bids && auction.bids.map((b: any) => (
                              <li key={b.id}>${b.amount} — {b.user?.username || 'Anonymous'} @ {new Date(b.timestamp).toLocaleString()}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  })()}

                  <button onClick={() => onAdd(selected)}>
                    Add to Cart
                  </button>

                  <button onClick={() => setSelected(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}