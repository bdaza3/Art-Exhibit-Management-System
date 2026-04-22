import { useEffect, useMemo, useState } from "react";
import PageTopBar from "../../components/PageTopBar";
import SideBar from "../../components/customer/SideBar";
import "./CustomerAuctionsPage.css";

type Bid = {
  id: number;
  amount?: number;
  anonymous?: boolean;
  timestamp?: string;
  user?: { id?: number | null; username?: string | null } | null;
};

type AuctionArtwork = {
  id: number;
  title?: string;
  artist?: string;
  image?: string;
  description?: string;
};

type Auction = {
  id: number;
  status?: string;
  start_time?: string;
  end_time?: string;
  starting_bid?: number;
  min_increment?: number;
  artwork?: AuctionArtwork;
  bids?: Bid[];
};

const API_AUCTIONS = "http://127.0.0.1:8000/api/auctions/";

const currency = (value?: number) => `$${Number(value || 0).toFixed(2)}`;

const formatDateTime = (value?: string) => {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not scheduled" : date.toLocaleString();
};

const highestBid = (auction: Auction) => {
  const bids = auction.bids || [];
  if (bids.length === 0) return Number(auction.starting_bid || 0);
  return Math.max(...bids.map((bid) => Number(bid.amount || 0)));
};

const sortedBids = (auction: Auction) =>
  [...(auction.bids || [])].sort((left, right) => Number(right.amount || 0) - Number(left.amount || 0));

export default function CustomerAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [query, setQuery] = useState("");
  const [bidInputs, setBidInputs] = useState<Record<number, string>>({});
  const [anonymousInputs, setAnonymousInputs] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState("");

  const loadAuctions = async (showLoading = false) => {
    if (showLoading) setLoading(true);

    try {
      const response = await fetch(API_AUCTIONS, { credentials: "include" });
      const payload = await response.json();
      setAuctions(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error(error);
      setMessage("Could not load auctions.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    void loadAuctions(true);
    const timer = window.setInterval(() => void loadAuctions(), 10000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleAuctions = useMemo(() => {
    const search = query.trim().toLowerCase();

    return auctions.filter((auction) => {
      const status = auction.status || "scheduled";
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const title = auction.artwork?.title || "";
      const artist = auction.artwork?.artist || "";
      const matchesQuery =
        !search ||
        title.toLowerCase().includes(search) ||
        artist.toLowerCase().includes(search);

      return matchesStatus && matchesQuery && status !== "cancelled";
    });
  }, [auctions, query, statusFilter]);

  const placeBid = async (auction: Auction) => {
    const current = highestBid(auction);
    const minIncrement = Number(auction.min_increment || 1);
    const minimumBid = current + minIncrement;
    const amount = Number(bidInputs[auction.id] || 0);

    if (auction.status !== "active") {
      setMessage("Bidding opens when this auction is active.");
      return;
    }

    if (!amount || amount < minimumBid) {
      setMessage(`Bid must be at least ${currency(minimumBid)}.`);
      return;
    }

    try {
      const response = await fetch(`${API_AUCTIONS}${auction.id}/place_bid/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount,
          anonymous: Boolean(anonymousInputs[auction.id]),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        setMessage(error?.error || "Bid failed. Please try again.");
        return;
      }

      setBidInputs((currentInputs) => ({ ...currentInputs, [auction.id]: "" }));
      setMessage("Bid placed successfully.");
      await loadAuctions();
    } catch (error) {
      console.error(error);
      setMessage("Bid failed. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <SideBar />

      <main className="customer-auctions-page">
        <PageTopBar title="Live Auctions" />

        <section className="customer-auctions-hero">
          <div>
            <h1>Live Auctions</h1>
            <p>Track current bids, review bidder history, and place bids on active gallery auctions.</p>
          </div>

          <button className="auction-refresh-btn" onClick={() => void loadAuctions(true)}>
            Refresh
          </button>
        </section>

        <section className="auction-toolbar">
          <input
            className="auction-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search artwork or artist"
          />

          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="ended">Ended</option>
            <option value="all">All</option>
          </select>
        </section>

        {message && <div className="auction-message">{message}</div>}
        {loading && <p className="auction-empty">Loading auctions...</p>}

        {!loading && (
          <section className="customer-auction-grid">
            {visibleAuctions.length === 0 && (
              <p className="auction-empty">No auctions match this view yet.</p>
            )}

            {visibleAuctions.map((auction) => {
              const currentBid = highestBid(auction);
              const minIncrement = Number(auction.min_increment || 1);
              const minimumBid = currentBid + minIncrement;
              const canBid = auction.status === "active";
              const bids = sortedBids(auction);

              return (
                <article key={auction.id} className="customer-auction-card">
                  <div
                    className="customer-auction-image"
                    style={{ backgroundImage: `url(${auction.artwork?.image || "https://via.placeholder.com/640x420?text=Artwork"})` }}
                  />

                  <div className="customer-auction-body">
                    <div className="customer-auction-heading">
                      <div>
                        <h2>{auction.artwork?.title || "Untitled artwork"}</h2>
                        <p>{auction.artwork?.artist || "Unknown artist"}</p>
                      </div>
                      <span className={`auction-status-pill status-${auction.status || "scheduled"}`}>
                        {auction.status || "scheduled"}
                      </span>
                    </div>

                    <div className="auction-stat-grid">
                      <div>
                        <span>Current bid</span>
                        <strong>{currency(currentBid)}</strong>
                      </div>
                      <div>
                        <span>Next minimum</span>
                        <strong>{currency(minimumBid)}</strong>
                      </div>
                      <div>
                        <span>Bid count</span>
                        <strong>{auction.bids?.length || 0}</strong>
                      </div>
                      <div>
                        <span>Ends</span>
                        <strong>{formatDateTime(auction.end_time)}</strong>
                      </div>
                    </div>

                    <div className="bid-panel">
                      <input
                        type="number"
                        min={minimumBid}
                        step="0.01"
                        value={bidInputs[auction.id] || ""}
                        onChange={(event) =>
                          setBidInputs((currentInputs) => ({
                            ...currentInputs,
                            [auction.id]: event.target.value,
                          }))
                        }
                        placeholder={`Minimum ${currency(minimumBid)}`}
                        disabled={!canBid}
                      />

                      <label>
                        <input
                          type="checkbox"
                          checked={Boolean(anonymousInputs[auction.id])}
                          onChange={(event) =>
                            setAnonymousInputs((currentInputs) => ({
                              ...currentInputs,
                              [auction.id]: event.target.checked,
                            }))
                          }
                          disabled={!canBid}
                        />
                        Anonymous
                      </label>

                      <button disabled={!canBid} onClick={() => void placeBid(auction)}>
                        Place Bid
                      </button>
                    </div>

                    {!canBid && (
                      <p className="auction-note">
                        {auction.status === "scheduled"
                          ? `Bidding starts ${formatDateTime(auction.start_time)}.`
                          : "Bidding is closed for this auction."}
                      </p>
                    )}

                    <div className="bid-history">
                      <h3>Bid History</h3>
                      {bids.length === 0 && <p>No bids yet.</p>}
                      {bids.slice(0, 5).map((bid) => (
                        <div key={bid.id} className="bid-history-row">
                          <span>{bid.user?.username || "Anonymous"}</span>
                          <strong>{currency(bid.amount)}</strong>
                          <small>{formatDateTime(bid.timestamp)}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
