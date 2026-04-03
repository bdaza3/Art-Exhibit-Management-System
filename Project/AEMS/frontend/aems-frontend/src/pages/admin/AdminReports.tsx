import React, { useMemo, useState, useEffect } from "react";
import AdminSideBar from "../../components/admin/AdminSideBar";
import "./AdminReports.css";

type Range = "7d" | "30d" | "90d" | "ytd";
type Category = "All" | "Art Sales" | "Tickets" | "Auctions";

type Activity = {
  id: string;
  time: string;
  type: "Order" | "Ticket" | "Auction" | "Refund";
  title: string;
  amount?: number;
  status: "Success" | "Pending" | "Failed";
};

type TopItem = {
  name: string;
  sub: string;
  value: number; 
};

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function pct(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export default function AdminReports() {
  const [range, setRange] = useState<Range>("30d");
  const [category, setCategory] = useState<Category>("All");
  const [backendMetrics, setBackendMetrics] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchMetrics() {
      try {
        const [ordersRes, aucRes, ticketsRes] = await Promise.all([
          fetch("/api/orders/"),
          fetch("/api/auctions/"),
          fetch("/api/tickets/"),
        ]);

        async function parseSafe(res: Response) {
          try {
            if (!res.ok) return [];
            const ct = (res.headers.get("content-type") || "").toLowerCase();
            if (ct.includes("application/json")) {
              const data = await res.json();
              return Array.isArray(data) ? data : [];
            }
            if (res.status === 204) return [];
            return [];
          } catch (e) {
            console.warn("Failed to parse JSON response", e);
            return [];
          }
        }

        const [orders, auctions, tickets] = await Promise.all([
          parseSafe(ordersRes),
          parseSafe(aucRes),
          parseSafe(ticketsRes),
        ]);

        const revenue = Array.isArray(orders) ? orders.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0) : 0;
        const ordersCount = Array.isArray(orders) ? orders.length : 0;
        const auctionsActive = Array.isArray(auctions) ? auctions.filter((a: any) => a.status === "active").length : 0;
        const ticketCount = Array.isArray(tickets) ? tickets.length : 0;
        const customers = Array.isArray(orders) ? new Set(orders.map((o: any) => o.customer)).size : 0;

        if (mounted) setBackendMetrics({ revenue, orders: ordersCount, tickets: ticketCount, auctions: auctionsActive, customers });
      } catch (err) {
        console.warn("Failed to fetch backend metrics", err);
      }
    }

    fetchMetrics();
    return () => { mounted = false };
  }, [range, category]);

  // --- Fake aggregated metrics (used as fallback)
  const metrics = useMemo(() => {
   
    const mult = range === "7d" ? 0.35 : range === "30d" ? 1 : range === "90d" ? 2.4 : 3.1;

    const base = {
      revenue: Math.round(48250 * mult),
      orders: Math.round(126 * mult),
      tickets: Math.round(312 * mult),
      auctions: Math.round(9 * mult),
      customers: Math.round(41 * mult),
      
      revDelta: 8.2,
      ordersDelta: 3.6,
      ticketsDelta: 6.9,
      auctionsDelta: -2.1,
      customersDelta: 4.8,
    };

    
    if (category === "Art Sales") {
      return { ...base, tickets: 0, ticketsDelta: 0, auctions: 0, auctionsDelta: 0 };
    }
    if (category === "Tickets") {
      return { ...base, revenue: Math.round(base.revenue * 0.42), orders: 0, ordersDelta: 0, auctions: 0, auctionsDelta: 0 };
    }
    if (category === "Auctions") {
      return { ...base, revenue: Math.round(base.revenue * 0.18), orders: Math.round(base.orders * 0.25), tickets: 0, ticketsDelta: 0 };
    }

    return base;
  }, [range, category]);

  const display = backendMetrics ? { ...backendMetrics, revDelta: 0, ordersDelta: 0, ticketsDelta: 0, auctionsDelta: 0, customersDelta: 0 } : metrics;

  const revenueByMonth = useMemo(() => {
    
    const raw = [22, 38, 35, 56, 61, 47, 72, 66, 80, 93, 88, 100];
    const label = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    return raw.map((v, i) => ({ v, label: label[i] }));
  }, []);

  const topArtworks: TopItem[] = useMemo(
    () => [
      { name: "Velvet Night", sub: "Sofia Marin", value: 13800 },
      { name: "Echoes in the Street", sub: "Piotr Banak", value: 9930 },
      { name: "Garden of Tranquility", sub: "Isabella Moretti", value: 7890 },
      { name: "Summer Reverie", sub: "Alex Todd", value: 6680 },
    ],
    []
  );

  const topExhibitions: TopItem[] = useMemo(
    () => [
      { name: "Urban Noir: Shadows of the City", sub: "Tickets sold", value: 164 },
      { name: "Impressionist Light: Modern Echoes", sub: "Tickets sold", value: 128 },
      { name: "Sculpture & Silence", sub: "Tickets sold", value: 96 },
      { name: "Chromatic Futures", sub: "Tickets sold", value: 74 },
    ],
    []
  );

  const activity: Activity[] = useMemo(
    () => [
      { id: "a1", time: "Today 10:42 AM", type: "Order", title: 'Artwork purchased: "Velvet Night"', amount: 4600, status: "Success" },
      { id: "a2", time: "Today 9:10 AM", type: "Ticket", title: "Tickets purchased: Urban Noir", amount: 56, status: "Success" },
      { id: "a3", time: "Yesterday 6:31 PM", type: "Auction", title: "Bid placed: Garden of Tranquility", amount: 8200, status: "Pending" },
      { id: "a4", time: "Yesterday 12:06 PM", type: "Refund", title: "Refund issued: Ticket order", amount: 28, status: "Success" },
      { id: "a5", time: "Mon 3:18 PM", type: "Order", title: 'Payment failed: "Silent Gallery"', amount: 1850, status: "Failed" },
    ],
    []
  );

  function exportCSV() {
    
    const rows = [
      ["time", "type", "title", "amount", "status"],
      ...activity.map((a) => [a.time, a.type, a.title, a.amount ?? "", a.status]),
    ];
    const csv = rows.map((r) => r.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `aems_reports_${range}_${category.replaceAll(" ", "_").toLowerCase()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="dashboard-layout">
      <AdminSideBar />

      <div className="dashboard-content">
        {/* Header */}
        <div className="reports-header">
          <div>
            <h2>Reports</h2>
            <p className="muted">Track sales, tickets, auctions, and customer activity.</p>
          </div>

          <div className="reports-actions">
            <div className="pill">
              <span className="pill-label">Range</span>
              <select value={range} onChange={(e) => setRange(e.target.value as Range)}>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="ytd">Year to date</option>
              </select>
            </div>

            <div className="pill">
              <span className="pill-label">Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                <option value="All">All</option>
                <option value="Art Sales">Art Sales</option>
                <option value="Tickets">Tickets</option>
                <option value="Auctions">Auctions</option>
              </select>
            </div>

            <button className="btn-gold" onClick={exportCSV}>
              Export CSV
            </button>
          </div>
        </div>

        {/* KPI grid */}
        <div className="kpi-grid">
          <KPI title="Revenue" value={money(display.revenue)} delta={display.revDelta ?? 0} />
          <KPI title="Orders" value={(display.orders || 0).toLocaleString()} delta={display.ordersDelta ?? 0} />
          <KPI title="Tickets Sold" value={(display.tickets || 0).toLocaleString()} delta={display.ticketsDelta ?? 0} />
          <KPI title="Active Auctions" value={(display.auctions || 0).toLocaleString()} delta={display.auctionsDelta ?? 0} />
          <KPI title="New Customers" value={(display.customers || 0).toLocaleString()} delta={display.customersDelta ?? 0} />
        </div>

        {/* Main grid */}
        <div className="reports-grid">
          <section className="panel">
            <div className="panel-top">
              <h3>Revenue Trend</h3>
              <span className="muted small">{backendMetrics ? 'Using backend metrics' : 'Mock data • Replace with backend later'}</span>
            </div>

            <div className="spark">
              {revenueByMonth.map((p) => (
                <div className="spark-col" key={p.label} title={`${p.label}: ${p.v}%`}>
                  <div className="spark-bar" style={{ height: `${p.v}%` }} />
                  <div className="spark-label">{p.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-top">
              <h3>Top Artworks</h3>
              <span className="muted small">By revenue</span>
            </div>

            <div className="list">
              {topArtworks.map((t) => (
                <div className="list-row" key={t.name}>
                  <div>
                    <div className="list-title">{t.name}</div>
                    <div className="muted small">{t.sub}</div>
                  </div>
                  <div className="list-value gold">{money(t.value)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-top">
              <h3>Top Exhibitions</h3>
              <span className="muted small">By ticket volume</span>
            </div>

            <div className="list">
              {topExhibitions.map((t) => (
                <div className="list-row" key={t.name}>
                  <div>
                    <div className="list-title">{t.name}</div>
                    <div className="muted small">{t.sub}</div>
                  </div>
                  <div className="list-value">{t.value.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-top">
              <h3>Recent Activity</h3>
              <span className="muted small">Orders • Tickets • Auctions</span>
            </div>

            <div className="activity">
              {activity.map((a) => (
                <div className="activity-row" key={a.id}>
                  <div className="activity-left">
                    <div className="activity-time muted small">{a.time}</div>
                    <div className="activity-title">{a.title}</div>
                    <div className="activity-meta muted small">{a.type}</div>
                  </div>

                  <div className="activity-right">
                    {typeof a.amount === "number" ? (
                      <div className="activity-amt">{money(a.amount)}</div>
                    ) : (
                      <div className="activity-amt muted">—</div>
                    )}
                    <StatusPill status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, delta }: { title: string; value: string; delta: number }) {
  return (
    <div className="kpi">
      <div className="kpi-title muted">{title}</div>
      <div className="kpi-value">{value}</div>
      <div className={`kpi-delta ${delta >= 0 ? "up" : "down"}`}>
        {pct(delta)} <span className="muted small">vs prev</span>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "Success" | "Pending" | "Failed" }) {
  return <span className={`status ${status.toLowerCase()}`}>{status}</span>;
}