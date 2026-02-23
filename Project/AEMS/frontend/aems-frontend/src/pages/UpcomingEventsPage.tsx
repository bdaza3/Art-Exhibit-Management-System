import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UpcomingEventsPage.css";
import Event1 from "../assets/Art/art_institute_chicago.jpeg";
import Event2 from "../assets/Art/MCA.jpeg";
import Event3 from "../assets/Art/National_Gallery_Victoria.jpeg";
import Event4 from "../assets/Art/Louvre.jpeg";
import Event5 from "../assets/Art/Museum_Modern_Art.jpeg";
import PageTopBar from "../components/PageTopBar";


type EventItem = {
  id: string;
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

const EVENTS: EventItem[] = [
  {
    id: "ev-201",
    title: "Impressionist Light: Modern Echoes",
    museum: "The Art Institute of Chicago",
    city: "Chicago, IL",
    startDate: "2026-03-01",
    endDate: "2026-05-15",
    time: "10:30 AM – 5:00 PM",
    ticketFrom: 28,
    description:
      "A curated exhibition exploring how modern painters reinterpret impressionist color theory, atmospheric perspective, and plein-air composition.",
    highlights: [
      "Curator talk every Saturday",
      "Limited edition catalog",
      "Interactive brushstroke study wall",
    ],
    image: Event1
     
  },
  {
    id: "ev-202",
    title: "Urban Noir: Shadows of the City",
    museum: "Museum of Contemporary Art",
    city: "Chicago, IL",
    startDate: "2026-03-12",
    endDate: "2026-06-20",
    time: "11:00 AM – 7:00 PM",
    ticketFrom: 22,
    description:
      "Monochrome studies of modern city life—architecture, anonymity, rain, reflection—through charcoal, graphite, and film-inspired photography.",
    highlights: ["Night hours on Thursdays", "Artist panel", "Print-making demo"],
    image:Event2
      
  },
  {
    id: "ev-203",
    title: "Still Water, Golden Air",
    museum: "National Gallery of Victoria",
    city: "Melbourne, AU",
    startDate: "2026-04-05",
    endDate: "2026-07-01",
    time: "10:00 AM – 5:00 PM",
    ticketFrom: 30,
    description:
      "An immersive nature exhibition focused on light, reflection, and the feeling of refuge—lush palettes, layered textures, and tranquil compositions.",
    highlights: ["Guided tours", "Family day", "Soundscape room"],
    image: Event3
      
  },
  {
  id: "ev-204",
  title: "Renaissance Reimagined: Digital Masters",
  museum: "The Louvre Digital Wing",
  city: "Paris, France",
  startDate: "2026-05-10",
  endDate: "2026-08-30",
  time: "9:30 AM – 6:00 PM",
  ticketFrom: 35,
  description:
    "A groundbreaking fusion of classical Renaissance masterpieces and immersive digital projection technology. Experience Michelangelo, Da Vinci, and Botticelli reinterpreted through motion, light, and augmented reality.",
  highlights: [
    "360° projection gallery","AI-guided Renaissance tour","Interactive restoration lab demo",],
  image: Event4 
},
{
  id: "ev-205",
  title: "Sculpted Silence: Modern Minimalism",
  museum: "Museum of Modern Art (MoMA)",
  city: "New York, NY",
  startDate: "2026-06-01",
  endDate: "2026-09-15",
  time: "10:00 AM – 8:00 PM",
  ticketFrom: 26,
  description:
    "An exploration of spatial harmony, shadow, and form. This exhibition features large-scale minimalist sculptures and installations designed to evoke calm, reflection, and architectural balance.",
  highlights: [
    "Artist walkthrough series",
    "Minimalist design workshop",
    "Evening silent viewing hours",
  ],
  image: Event5
   
},
];

function formatDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UpcomingEventsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [museum, setMuseum] = useState("All");
  const [sort, setSort] = useState<"soonest" | "latest">("soonest");
  const [selected, setSelected] = useState<EventItem | null>(null);

  const museums = useMemo(() => {
    const unique = Array.from(new Set(EVENTS.map((e) => e.museum)));
    return ["All", ...unique];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = EVENTS.filter((e) => {
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.museum.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q);

      const matchesMuseum = museum === "All" || e.museum === museum;
      return matchesQuery && matchesMuseum;
    });

    list = list.sort((a, b) =>
      sort === "soonest"
        ? a.startDate.localeCompare(b.startDate)
        : b.startDate.localeCompare(a.startDate)
    );

    return list;
  }, [query, museum, sort]);

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
                  backgroundImage: selected.image
                    ? `linear-gradient(0deg, rgba(0,0,0,.55), rgba(0,0,0,.15)), url(${selected.image})`
                    : undefined,
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