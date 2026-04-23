import { Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import AdminSideBar from "../../components/admin/AdminSideBar";
import {
  buildDashboardMetrics,
  buildTopArtworks,
  buildTrendSeries,
  fetchAdminAnalyticsData,
  formatCompactCurrency,
  formatCurrency,
  formatDelta,
} from "./adminAnalytics";
import type { AnalyticsBundle, AuctionRecord, RangeKey } from "./adminAnalytics";

const DASHBOARD_RANGE: RangeKey = "30d";

const formatRelativeTime = (value?: string) => {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absDiffInSeconds = Math.abs(diffInSeconds);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absDiffInSeconds < 60) return formatter.format(diffInSeconds, "second");

  const diffInMinutes = Math.round(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) return formatter.format(diffInMinutes, "minute");

  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) return formatter.format(diffInHours, "hour");

  const diffInDays = Math.round(diffInHours / 24);
  return formatter.format(diffInDays, "day");
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Curator";

  const [data, setData] = useState<AnalyticsBundle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      const payload = await fetchAdminAnalyticsData();
      if (!active) return;
      setData(payload);
      setLoading(false);
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    if (!data) return null;
    return buildDashboardMetrics(data, DASHBOARD_RANGE);
  }, [data]);

  const chartSeries = useMemo(() => {
    if (!data) return [];
    return buildTrendSeries(data, DASHBOARD_RANGE, "All");
  }, [data]);

  const topArtworks = useMemo(() => {
    if (!data) return [];
    return buildTopArtworks(data, DASHBOARD_RANGE).slice(0, 4);
  }, [data]);

  const recentOrders = useMemo(() => {
    if (!data) return [];
    return data.orders
      .slice()
      .sort((left, right) => new Date(right.created_at || "").getTime() - new Date(left.created_at || "").getTime())
      .slice(0, 5);
  }, [data]);

  const upcomingExhibitions = useMemo(() => {
    if (!data) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return data.exhibitions
      .filter((exhibition) => {
        const date = exhibition.date ? new Date(exhibition.date) : null;
        return date && !Number.isNaN(date.getTime()) && date >= today;
      })
      .sort((left, right) => new Date(left.date || "").getTime() - new Date(right.date || "").getTime())
      .slice(0, 4);
  }, [data]);

  const recentAuctionActivity = useMemo(() => {
    if (!data) return [];

    return data.auctions
      .filter((auction) => Array.isArray(auction.bids) && auction.bids.length > 0)
      .map((auction) => {
        const latestBid = auction.bids![0];
        return { auction, latestBid };
      })
      .sort((left, right) => new Date(right.latestBid.timestamp || "").getTime() - new Date(left.latestBid.timestamp || "").getTime())
      .slice(0, 4);
  }, [data]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ display: "flex" }}>
      <AdminSideBar />

      <div className="admin-page">
        <div className="dash-header dashboard-header-row">
          <div>
            <h2 className="admin-title">Welcome back, {username}.</h2>
            <p className="muted">Overview of your art collection across orders, tickets, exhibitions, and auctions.</p>
          </div>

          <div className="dashboard-actions">
            <Button variant="contained" onClick={() => navigate("/admin/events")} sx={{ bgcolor: "#d4af37", color: "#111", textTransform: "none", borderRadius: "12px" }}>
              New Exhibition
            </Button>
            <Button variant="outlined" onClick={() => navigate("/admin/arts")} sx={{ color: "#fff", borderColor: "rgba(212,175,55,0.45)", textTransform: "none", borderRadius: "12px" }}>
              Add Artwork
            </Button>
            <Button onClick={logout} sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.12)", textTransform: "none", borderRadius: "12px" }}>
              Logout
            </Button>
          </div>
        </div>

        {loading && <p className="muted">Loading dashboard data...</p>}

        {metrics && (
          <div className="dashboard-stack">
            <section className="dashboard-summary-grid">
              <SummaryCard title="Gross Sales" value={formatCurrency(metrics.revenue.value)} delta={metrics.revenue.delta} accent="gold" />
              <SummaryCard title="Orders" value={metrics.orders.value.toLocaleString()} delta={metrics.orders.delta} />
              <SummaryCard title="Tickets Sold" value={metrics.tickets.value.toLocaleString()} delta={metrics.tickets.delta} />
              <SummaryCard title="Customers" value={metrics.customers.value.toLocaleString()} delta={metrics.customers.delta} />
              <SnapshotCard title="Live Auctions" value={metrics.activeAuctions.toLocaleString()} subtitle="Currently active" />
              <SnapshotCard title="Avg. Order" value={formatCurrency(metrics.averageOrderValue)} subtitle="Across the last 30 days" />
            </section>

            <section className="dashboard-main-grid">
              <div className="admin-surface dashboard-chart-panel">
                <div className="admin-surface-header">
                  <div>
                    <h2 className="admin-surface-title">Sales Overview</h2>
                    <p className="muted small-copy">Real revenue totals grouped across the last 30 days.</p>
                  </div>
                  <Link to="/admin/reports" className="dashboard-inline-link">Open reports</Link>
                </div>

                <DashboardChart data={chartSeries} />

                <div className="dashboard-chart-highlights">
                  <HighlightStat label="Upcoming Exhibitions" value={metrics.upcomingExhibitions.toLocaleString()} />
                  <HighlightStat label="Sold Artworks" value={metrics.soldArtworks.toLocaleString()} />
                  <HighlightStat label="Period Revenue" value={formatCompactCurrency(metrics.revenue.value)} />
                </div>
              </div>

              <div className="dashboard-side-stack">
                <div className="admin-surface">
                  <div className="admin-surface-header">
                    <h2 className="admin-surface-title">Top Artworks</h2>
                    <span className="muted small-copy">By revenue in the last 30 days</span>
                  </div>

                  <div className="dashboard-list">
                    {topArtworks.length === 0 && <div className="empty-note muted">No artwork sales recorded yet.</div>}
                    {topArtworks.map((artwork) => (
                      <div className="dashboard-list-row" key={artwork.name}>
                        <div>
                          <div className="dashboard-list-title">{artwork.name}</div>
                          <div className="muted small-copy">{artwork.sub}</div>
                        </div>
                        <div className="dashboard-list-value">{formatCurrency(artwork.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-surface">
                  <div className="admin-surface-header">
                    <h2 className="admin-surface-title">Recent Auction Activity</h2>
                    <span className="muted small-copy">Latest bids across active and closed auctions</span>
                  </div>

                  <div className="dashboard-list">
                    {recentAuctionActivity.length === 0 && <div className="empty-note muted">No bids have been placed yet.</div>}
                    {recentAuctionActivity.map(({ auction, latestBid }) => (
                      <AuctionActivityRow key={auction.id} auction={auction} bid={latestBid} />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="dashboard-lower-grid">
              <div className="admin-surface">
                <div className="admin-surface-header">
                  <h2 className="admin-surface-title">Recent Orders</h2>
                  <Link to="/admin/orders" className="dashboard-inline-link">Manage orders</Link>
                </div>

                <div className="dashboard-list">
                  {recentOrders.length === 0 && <div className="empty-note muted">No customer orders have been recorded yet.</div>}
                  {recentOrders.map((order) => (
                    <div className="dashboard-list-row" key={order.id}>
                      <div>
                        <div className="dashboard-list-title">Order #{order.id} from {order.customer || "Customer"}</div>
                        <div className="muted small-copy">{order.artwork_title || order.items?.[0]?.title || "Purchased item"} • {formatRelativeTime(order.created_at)}</div>
                      </div>
                      <div className="dashboard-order-meta">
                        <div className="dashboard-list-value">{formatCurrency(Number(order.total || order.total_price || 0))}</div>
                        <span className="status-badge">{order.status || "Pending"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-surface">
                <div className="admin-surface-header">
                  <h2 className="admin-surface-title">Upcoming Exhibitions</h2>
                  <Link to="/admin/events" className="dashboard-inline-link">Manage exhibitions</Link>
                </div>

                <div className="dashboard-list">
                  {upcomingExhibitions.length === 0 && <div className="empty-note muted">No upcoming exhibitions are scheduled.</div>}
                  {upcomingExhibitions.map((exhibition) => (
                    <div className="dashboard-event-row" key={exhibition.id}>
                      <div className="dashboard-event-thumb">
                        {exhibition.image ? (
                          <img src={exhibition.image} alt={exhibition.title} />
                        ) : (
                          <div className="dashboard-event-placeholder">No image</div>
                        )}
                      </div>

                      <div className="dashboard-event-copy">
                        <div className="dashboard-list-title">{exhibition.title}</div>
                        <div className="muted small-copy">{exhibition.venue || exhibition.location || "Exhibition venue"}</div>
                        <div className="muted small-copy">{exhibition.date ? new Date(exhibition.date).toLocaleDateString() : "Date TBD"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  delta,
  accent,
}: {
  title: string;
  value: string;
  delta: number;
  accent?: "gold";
}) {
  return (
    <div className={`dashboard-stat-card ${accent === "gold" ? "is-gold" : ""}`}>
      <div className="dashboard-stat-label">{title}</div>
      <div className="dashboard-stat-value">{value}</div>
      <div className={`dashboard-stat-delta ${delta >= 0 ? "up" : "down"}`}>{formatDelta(delta)} vs previous period</div>
    </div>
  );
}

function SnapshotCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="dashboard-stat-card">
      <div className="dashboard-stat-label">{title}</div>
      <div className="dashboard-stat-value">{value}</div>
      <div className="dashboard-stat-subtitle">{subtitle}</div>
    </div>
  );
}

function HighlightStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="dashboard-highlight">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AuctionActivityRow({
  auction,
  bid,
}: {
  auction: AuctionRecord;
  bid: NonNullable<AuctionRecord["bids"]>[number];
}) {
  return (
    <div className="dashboard-list-row">
      <div>
        <div className="dashboard-list-title">{auction.artwork?.title || `Auction #${auction.id}`}</div>
        <div className="muted small-copy">
          {bid.user?.username || (bid.anonymous ? "Anonymous bidder" : "Bidder")} • {formatRelativeTime(bid.timestamp)}
        </div>
      </div>
      <div className="dashboard-order-meta">
        <div className="dashboard-list-value">{formatCurrency(Number(bid.amount || 0))}</div>
        <span className="status-badge">{auction.status || "scheduled"}</span>
      </div>
    </div>
  );
}

function DashboardChart({ data }: { data: Array<{ key: string; label: string; value: number }> }) {
  const max = Math.max(...data.map((point) => point.value), 1);
  const width = 720;
  const height = 260;
  const padding = 24;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const points = data.map((point, index) => {
    const x = data.length === 1 ? width / 2 : padding + (index / (data.length - 1)) * usableWidth;
    const y = height - padding - (point.value / max) * usableHeight;
    return { ...point, x, y };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : "";

  return (
    <div className="dashboard-chart-shell">
      {data.every((point) => point.value === 0) ? (
        <div className="empty-note muted">Sales data will appear here once orders start coming in.</div>
      ) : (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} className="dashboard-chart-svg" preserveAspectRatio="none">
            {[0, 0.25, 0.5, 0.75, 1].map((step) => {
              const y = height - padding - step * usableHeight;
              return <line key={step} x1={padding} x2={width - padding} y1={y} y2={y} className="dashboard-chart-gridline" />;
            })}
            <path d={areaPath} className="dashboard-chart-area" />
            <path d={linePath} className="dashboard-chart-line" />
            {points.map((point) => (
              <g key={point.key}>
                <circle cx={point.x} cy={point.y} r="4" className="dashboard-chart-point" />
                <title>{`${point.label}: ${formatCurrency(point.value)}`}</title>
              </g>
            ))}
          </svg>

          <div className="dashboard-chart-labels">
            {data.map((point) => (
              <div className="dashboard-chart-label" key={point.key}>
                <span>{point.label}</span>
                <strong>{formatCompactCurrency(point.value)}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
