import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UpcomingEventsPage.css";
import PageTopBar from "../components/PageTopBar";
import DefaultAicImage from "../assets/Art/art_institute_chicago.jpeg";

const ARCHIVE_EVENTS_API = "http://127.0.0.1:8000/api/events/archive/";


type EventItem = {
  id: string;
  source: "aic" | "serp";
  title: string;
  museum: string;
  city: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  time: string;      // "10:00 AM – 6:00 PM"
  description: string;
  highlights: string[];
  image?: string; // optional bg image
  ticketFrom: number;
};

function formatDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function normalizeDate(value: unknown) {
  const raw = String(value ?? "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : new Date().toISOString().slice(0, 10);
}

export default function UpcomingEventsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [museum, setMuseum] = useState("All");
  const [sort, setSort] = useState<"soonest" | "latest">("soonest");
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(ARCHIVE_EVENTS_API);
        if (!res.ok) throw new Error("Failed to load archived events");
        const payload = await res.json();
        const rows = Array.isArray(payload?.data) ? payload.data : [];

        const deduped: EventItem[] = rows.map((row: any, idx: number) => ({
          id: String(row.id ?? `${row.source ?? "evt"}-${idx}`),
          source: row.source === "serp" ? "serp" : "aic",
          title: String(row.title ?? "Untitled Event"),
          museum: String(row.museum ?? "Chicago Art Events"),
          city: String(row.city ?? "Chicago, IL"),
          startDate: normalizeDate(row.startDate),
          endDate: normalizeDate(row.endDate ?? row.startDate),
          time: String(row.time ?? row.when ?? "Event Time TBA"),
          description: String(row.description ?? "No description available."),
          highlights: Array.isArray(row.highlights) ? row.highlights.map(String) : [],
          image: row.image ? String(row.image) : row.thumbnail ? String(row.thumbnail) : DefaultAicImage,
          ticketFrom: Number(row.ticketFrom ?? 20),
        }));

        deduped.sort((a, b) => a.startDate.localeCompare(b.startDate));

        if (deduped.length === 0) {
          throw new Error("No events available");
        }

        if (!cancelled) {
          setEvents(deduped);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load live events right now.");
          setEvents([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const museums = useMemo(() => {
    const unique = Array.from(new Set(events.map((e) => e.museum)));
    return ["All", ...unique];
  }, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = events.filter((e) => {
      const matchesMuseum = museum === "All" || e.museum === museum;
      if (!matchesMuseum) return false;

      // Keep all museum-matching events visible until the user enters a search term.
      if (!q) return true;

      return (
        e.title.toLowerCase().includes(q) ||
        e.museum.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) =>
      sort === "soonest"
        ? a.startDate.localeCompare(b.startDate)
        : b.startDate.localeCompare(a.startDate)
    );

    return list;
  }, [events, query, museum, sort]);

  function goBuyTickets(ev: EventItem) {
    // pass selection to tickets page
    navigate("/customer/tickets", { state: { eventId: ev.id } });
  }

  return (
    <div className="events-page">
        <PageTopBar title="Upcoming Events" />
      <div className="events-hero">
        <div>
          <h2>Upcoming Events</h2>
          <p className="muted">Browse exhibitions and reserve tickets. Click any event for details.</p>
        </div>

        <div className="events-controls">
          <input
            className="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, museum, city…"
          />
          <select value={museum} onChange={(e) => setMuseum(e.target.value)}>
            {museums.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="soonest">Sort: Soonest</option>
            <option value="latest">Sort: Latest</option>
          </select>
        </div>
      </div>

      <div className="events-grid">
          {loading && <p className="muted">Loading events...</p>}
          {!loading && error && <p className="muted">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="muted">No events found for your current filters.</p>
          )}
          {filtered.map((ev) => (
    <button
      key={ev.id}
      className="event-card"
      type="button"
      onClick={() => setSelected(ev)}
    >
      <div
        className="event-cover"
        style={{
          backgroundImage: ev.image ? `url(${ev.image})` : "none",
          backgroundSize: ev.source === "serp" ? "contain" : "cover",
          backgroundRepeat: "no-repeat",
        }}
      >

        <span className="event-status">SHOWING</span>
        <span className="event-price">From ${ev.ticketFrom}</span>
      </div>

      <div className="event-body">
        <div className="event-title">{ev.title}</div>

        <div className="event-meta">
          <span className="pill">{ev.museum}</span>
          <span className="dot">•</span>
          <span className="muted">{formatDate(ev.startDate)}</span>
          <span className="dot">•</span>
          <span className="muted">{ev.city}</span>
        </div>

        <div className="event-desc muted">
          {ev.description}
        </div>
      </div>
    </button>
  ))}
      </div>

      {selected && (
        <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <div className="modal-title">{selected.title}</div>
                <div className="muted">{selected.museum} • {selected.city}</div>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div
                className="modal-image"
                style={{
                  backgroundImage: selected.image ? `url(${selected.image})` : undefined,
                  backgroundSize: selected.source === "serp" ? "contain" : "cover",
                  backgroundRepeat: "no-repeat",
                }}
              />

              <div className="modal-details">
                <div className="detail-row">
                  <span className="label">Dates</span>
                  <span className="value">
                    {formatDate(selected.startDate)} – {formatDate(selected.endDate)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Hours</span>
                  <span className="value">{selected.time}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Tickets from</span>
                  <span className="value gold">${selected.ticketFrom}</span>
                </div>

                <div className="block">
                  <div className="block-title">About</div>
                  <div className="block-text muted">{selected.description}</div>
                </div>

                <div className="block">
                  <div className="block-title">Highlights</div>
                  <ul className="list">
                    {selected.highlights.map((h) => (
                      <li key={h} className="muted">{h}</li>
                    ))}
                  </ul>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={() => goBuyTickets(selected)}>
                    Buy tickets
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

    </div>
  );
}