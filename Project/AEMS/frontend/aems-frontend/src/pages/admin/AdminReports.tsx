import { useEffect, useMemo, useState } from "react";
import AdminSideBar from "../../components/admin/AdminSideBar";
import "./AdminDashboard.css";
import "./AdminReports.css";
import {
  buildActivity,
  buildReportMetrics,
  buildTopArtworks,
  buildTopExhibitions,
  buildTrendSeries,
  fetchAdminAnalyticsData,
  formatCompactCurrency,
  formatCurrency,
  formatDelta,
} from "./adminAnalytics";
import type { ActivityItem, AnalyticsBundle, RangeKey, ReportCategory } from "./adminAnalytics";

export default function AdminReports() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [category, setCategory] = useState<ReportCategory>("All");
  const [data, setData] = useState<AnalyticsBundle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      setLoading(true);
      const payload = await fetchAdminAnalyticsData();
      if (!active) return;
      setData(payload);
      setLoading(false);
    }

    loadAnalytics();
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    if (!data) return null;
    return buildReportMetrics(data, range, category);
  }, [category, data, range]);

  const trendSeries = useMemo(() => {
    if (!data) return [];
    return buildTrendSeries(data, range, category);
  }, [category, data, range]);

  const topArtworks = useMemo(() => {
    if (!data) return [];
    return buildTopArtworks(data, range);
  }, [data, range]);

  const topExhibitions = useMemo(() => {
    if (!data) return [];
    return buildTopExhibitions(data, range);
  }, [data, range]);

  const activity = useMemo<ActivityItem[]>(() => {
    if (!data) return [];
    return buildActivity(data, range);
  }, [data, range]);

  function exportCSV() {
    const rows = [
      ["timestamp", "type", "title", "detail", "amount", "status"],
      ...activity.map((entry) => [
        entry.timestamp,
        entry.type,
        entry.title,
        entry.detail,
        entry.amount ?? "",
        entry.status,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aems_reports_${range}_${category.replaceAll(" ", "_").toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const hasData = !!data;

  return (
    <div style={{ display: "flex" }}>
      <AdminSideBar />

      <div className="admin-page">
        <div className="reports-header">
          <div>
            <h1 className="admin-title" style={{ marginBottom: 8 }}>Reports</h1>
            <p className="muted">Live admin reporting for sales, ticket activity, auctions, and customers.</p>
          </div>

          <div className="reports-actions">
            <div className="pill">
              <span className="pill-label">Range</span>
              <select value={range} onChange={(event) => setRange(event.target.value as RangeKey)}>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="ytd">Year to date</option>
              </select>
            </div>

            <div className="pill">
              <span className="pill-label">Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as ReportCategory)}>
                <option value="All">All</option>
                <option value="Art Sales">Art Sales</option>
                <option value="Tickets">Tickets</option>
                <option value="Auctions">Auctions</option>
              </select>
            </div>

            <button className="btn-gold" onClick={exportCSV} disabled={!activity.length}>
              Export CSV
            </button>
          </div>
        </div>

        {loading && <p className="muted">Loading report data...</p>}

        {!loading && !hasData && <p className="muted">No report data available right now.</p>}

        {metrics && (
          <>
            <div className="kpi-grid">
              <KPI title="Revenue" value={formatCurrency(metrics.revenue.value)} delta={metrics.revenue.delta} />
              <KPI title={category === "Auctions" ? "Auctions" : "Orders"} value={metrics.orders.value.toLocaleString()} delta={metrics.orders.delta} />
              <KPI title="Tickets Sold" value={metrics.tickets.value.toLocaleString()} delta={metrics.tickets.delta} />
              <KPI title="Active Auctions" value={metrics.auctions.value.toLocaleString()} delta={metrics.auctions.delta} neutral />
              <KPI title={category === "Auctions" ? "Bidders" : "Customers"} value={metrics.customers.value.toLocaleString()} delta={metrics.customers.delta} />
            </div>

            <div className="reports-grid">
              <section className="panel panel-wide">
                <div className="panel-top">
                  <div>
                    <h3>{category === "Auctions" ? "Auction Value Trend" : "Revenue Trend"}</h3>
                    <span className="muted small">Derived from live admin data for the selected range.</span>
                  </div>
                  <div className="trend-total">{formatCompactCurrency(trendSeries.reduce((sum, point) => sum + point.value, 0))}</div>
                </div>

                <TrendChart data={trendSeries} />
              </section>

              <section className="panel">
                <div className="panel-top">
                  <h3>Top Artworks</h3>
                  <span className="muted small">Highest revenue in this range</span>
                </div>

                <div className="list">
                  {topArtworks.length === 0 && <div className="empty-state muted">No artwork sales recorded for this range.</div>}
                  {topArtworks.map((item) => (
                    <div className="list-row" key={item.name}>
                      <div>
                        <div className="list-title">{item.name}</div>
                        <div className="muted small">{item.sub}</div>
                      </div>
                      <div className="list-value gold">{formatCurrency(item.value)}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="panel-top">
                  <h3>Top Exhibitions</h3>
                  <span className="muted small">Ticket volume in this range</span>
                </div>

                <div className="list">
                  {topExhibitions.length === 0 && <div className="empty-state muted">No ticket purchases have been recorded yet.</div>}
                  {topExhibitions.map((item) => (
                    <div className="list-row" key={item.name}>
                      <div>
                        <div className="list-title">{item.name}</div>
                        <div className="muted small">{item.sub}</div>
                      </div>
                      <div className="list-value">{item.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="panel-top">
                  <h3>Recent Activity</h3>
                  <span className="muted small">Orders, tickets, and bids from the selected period</span>
                </div>

                <div className="activity">
                  {activity.length === 0 && <div className="empty-state muted">No activity has been recorded in this range.</div>}
                  {activity.map((entry) => (
                    <div className="activity-row" key={entry.id}>
                      <div className="activity-left">
                        <div className="activity-time muted small">{formatTimestamp(entry.timestamp)}</div>
                        <div className="activity-title">{entry.title}</div>
                        <div className="activity-meta muted small">{entry.detail}</div>
                      </div>

                      <div className="activity-right">
                        {typeof entry.amount === "number" ? (
                          <div className="activity-amt">{formatCurrency(entry.amount)}</div>
                        ) : (
                          <div className="activity-amt muted">-</div>
                        )}
                        <StatusPill status={entry.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KPI({
  title,
  value,
  delta,
  neutral = false,
}: {
  title: string;
  value: string;
  delta: number;
  neutral?: boolean;
}) {
  return (
    <div className="kpi">
      <div className="kpi-title muted">{title}</div>
      <div className="kpi-value">{value}</div>
      <div className={`kpi-delta ${neutral ? "neutral" : delta >= 0 ? "up" : "down"}`}>
        {neutral ? "Current snapshot" : `${formatDelta(delta)} `}
        {!neutral && <span className="muted small">vs previous period</span>}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "Success" | "Pending" | "Failed" }) {
  return <span className={`status ${status.toLowerCase()}`}>{status}</span>;
}

function TrendChart({ data }: { data: Array<{ key: string; label: string; value: number }> }) {
  const max = Math.max(...data.map((point) => point.value), 1);
  const width = 640;
  const height = 220;
  const padding = 20;
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
    <div className="trend-chart">
      {data.every((point) => point.value === 0) ? (
        <div className="empty-state muted">Not enough sales data yet to draw a trend.</div>
      ) : (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} className="trend-svg" preserveAspectRatio="none">
            {[0, 0.25, 0.5, 0.75, 1].map((step) => {
              const y = height - padding - step * usableHeight;
              return <line key={step} x1={padding} x2={width - padding} y1={y} y2={y} className="trend-gridline" />;
            })}
            <path d={areaPath} className="trend-area" />
            <path d={linePath} className="trend-line" />
            {points.map((point) => (
              <g key={point.key}>
                <circle cx={point.x} cy={point.y} r="4" className="trend-point" />
                <title>{`${point.label}: ${formatCurrency(point.value)}`}</title>
              </g>
            ))}
          </svg>

          <div className="trend-labels">
            {data.map((point) => (
              <div key={point.key} className="trend-label">
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

function formatTimestamp(value: string) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
