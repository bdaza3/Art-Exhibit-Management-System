import React, { useMemo, useRef, useState } from "react";
import "./ViewBuyArtPage.css";
import PageTopBar from "../components/PageTopBar";
import SideBar from "../components/SideBar";
import ArtViewer3D from "../components/customer/3DArtworkViewer";
import {
  ARTWORKS,
  addToCart,
  getCart,
  formatMoney,
} from "../lib/artData";

import type { Artwork } from "../lib/artData";

export default function ViewBuyArtPage() {
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("All");
  const [sort, setSort] = useState<"newest" | "priceLow" | "priceHigh">("newest");

  const [selected, setSelected] = useState<Artwork | null>(null);
  const [toast, setToast] = useState("");
  const [show3D, setShow3D] = useState(false);

  const artists = useMemo(() => {
    const unique = Array.from(new Set(ARTWORKS.map((a) => a.artist)));
    return ["All", ...unique];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = ARTWORKS.filter((a) => {
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.artist.toLowerCase().includes(q) ||
        a.medium.toLowerCase().includes(q);

      const matchesArtist = artist === "All" || a.artist === artist;

      return matchesQuery && matchesArtist;
    });

    if (sort === "newest") {
      list = list.sort((a, b) => (a.dateCreated < b.dateCreated ? 1 : -1));
    } else if (sort === "priceLow") {
      list = list.sort((a, b) => a.price - b.price);
    } else if (sort === "priceHigh") {
      list = list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [query, artist, sort]);

  function onAdd(art: Artwork) {
    addToCart(art);
    setToast(`Added "${art.title}" to cart`);
    window.setTimeout(() => setToast(""), 1200);
  }

  const gridRef = useRef<HTMLDivElement>(null);

  function scrollToGrid() {
    gridRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div style={{ display: "flex" }}>
      <SideBar />
      <div className="art-page">
      <PageTopBar title="View / Buy Arts" />
      <div className="art-hero">
        <div>
          <h2>View / Buy Art</h2>
          <p className="muted">
            Explore curated works by artists. Click any piece for full details.
          </p>
          <button className="scroll-down-btn" onClick={scrollToGrid} type="button">
            Browse Collection ▼
          </button>
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
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="newest">Sort: Newest</option>
            <option value="priceLow">Sort: Price (Low → High)</option>
            <option value="priceHigh">Sort: Price (High → Low)</option>
          </select>
        </div>
      </div>

      <div className="art-grid" ref={gridRef}>
        {filtered.map((art) => (
          <button
            key={art.id}
            className="art-card"
            onClick={() => { setSelected(art); setShow3D(false); }}
            type="button"
          >
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

      {/* Modal */}
      {selected && (
        <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <div className="modal-title">{selected.title}</div>
                <div className="muted">{selected.artist}</div>
              </div>

              <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="modal-content">
                <div className="modal-left">
                  <div className="modal-image" style={{ backgroundImage: `url(${selected.image})` }}>
                    {selected.modelUrl && (
                      <button
                        className="btn btn-ghost viewer-toggle"
                        onClick={() => setShow3D((s) => !s)}
                        type="button"
                      >
                        {show3D ? "Show Image" : "View 3D"}
                      </button>
                    )}
                  </div>

                  {show3D && selected.modelUrl && (
                    <div style={{ marginTop: 12 }}>
                      <ArtViewer3D modelUrl={selected.modelUrl} height={420} />
                    </div>
                  )}
                </div>

              <div className="modal-details">
                <div className="detail-row">
                  <span className="label">Price</span>
                  <span className="value gold">{formatMoney(selected.price)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Created</span>
                  <span className="value">{selected.dateCreated}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Medium</span>
                  <span className="value">{selected.medium}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Dimensions</span>
                  <span className="value">{selected.dimensions}</span>
                </div>

                <div className="block">
                  <div className="block-title">Purpose</div>
                  <div className="block-text muted">{selected.purpose}</div>
                </div>

                <div className="block">
                  <div className="block-title">Description</div>
                  <div className="block-text muted">{selected.description}</div>
                </div>

                <div className="block">
                  <div className="block-title">Museums Exhibited</div>
                  <ul className="museum-list">
                    {selected.museumsExhibited.map((m) => (
                      <li key={m} className="muted">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={() => onAdd(selected)}>
                    Add to cart
                  </button>
                  <button className="btn btn-ghost" onClick={() => setSelected(null)}>
                    Close
                  </button>
                </div>
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