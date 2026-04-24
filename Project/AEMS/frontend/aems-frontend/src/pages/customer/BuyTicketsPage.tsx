import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BuyTicketsPage.css";
import SideBar from "../../components/customer/SideBar";
import "./CustomerSubpage.css";
import DefaultAicImage from "../../assets/Art/art_institute_chicago.jpeg";

type TicketType = "General" | "Student" | "VIP";

type TicketEvent = {
  id: string;
  title: string;
  museum: string;
  city: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  image?: string;
};

type CartItem = {
  id: string;
  title: string;
  artist?: string;
  price: number;
  image?: string;
  qty: number;
};

const CART_KEY = "aems_cart";
const ARCHIVE_EVENTS_API = "http://127.0.0.1:8000/api/events/archive/";
const EXHIBITIONS_API = "http://127.0.0.1:8000/api/exhibitions/";

function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function setCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart_updated"));
}

function priceFor(type: TicketType, base: number) {
  if (type === "Student") return Math.max(10, base - 8);
  if (type === "VIP") return base + 18;
  return base;
}

function formatDate(d: string) {
  const dt = new Date(`${d}T00:00:00`);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function normalizeDate(value: unknown) {
  const raw = String(value ?? "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : new Date().toISOString().slice(0, 10);
}

export default function BuyTicketsPage() {
  const nav = useNavigate();
  const location = useLocation() as { state?: { eventId?: string } };

  const preselectId = location?.state?.eventId;
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [eventId, setEventId] = useState("");
  const [type, setType] = useState<TicketType>("General");
  const [qty, setQty] = useState(2);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      const [archiveResult, exhibitionsResult] = await Promise.allSettled([
        fetch(ARCHIVE_EVENTS_API),
        fetch(EXHIBITIONS_API),
      ]);

      const archivePayload =
        archiveResult.status === "fulfilled" && archiveResult.value.ok
          ? await archiveResult.value.json()
          : null;
      const exhibitionsPayload =
        exhibitionsResult.status === "fulfilled" && exhibitionsResult.value.ok
          ? await exhibitionsResult.value.json()
          : null;

      const archiveRows = Array.isArray(archivePayload?.data) ? archivePayload.data : [];
      const exhibitionRows = Array.isArray(exhibitionsPayload) ? exhibitionsPayload : [];

      const archiveEvents: TicketEvent[] = archiveRows.map((row: any, idx: number) => ({
        id: String(row.id ?? `${row.source ?? "evt"}-${idx}`),
        title: String(row.title ?? "Untitled Event"),
        museum: String(row.museum ?? "Chicago Art Events"),
        city: String(row.city ?? "Chicago, IL"),
        startDate: normalizeDate(row.startDate),
        endDate: normalizeDate(row.endDate ?? row.startDate),
        basePrice: Number(row.ticketFrom ?? 20),
        image: row.image ? String(row.image) : row.thumbnail ? String(row.thumbnail) : DefaultAicImage,
      }));

      const adminEvents: TicketEvent[] = exhibitionRows.map((row: any, idx: number) => ({
        id: String(row.id ?? `admin-${idx}`),
        title: String(row.title ?? "Untitled Exhibition"),
        museum: String(row.venue ?? "Museum Exhibition"),
        city: String(row.location ?? "Location TBA"),
        startDate: normalizeDate(row.date),
        endDate: normalizeDate(row.date),
        basePrice: Number(row.ticketFrom ?? 20),
        image: row.image ? String(row.image) : DefaultAicImage,
      }));

      const mergedEvents = [...adminEvents, ...archiveEvents]
        .filter((event, index, list) => {
          return (
            index ===
            list.findIndex(
              (candidate) =>
                candidate.title.toLowerCase() === event.title.toLowerCase() &&
                candidate.museum.toLowerCase() === event.museum.toLowerCase() &&
                candidate.startDate === event.startDate
            )
          );
        })
        .sort((a, b) => a.startDate.localeCompare(b.startDate));

      if (cancelled) return;

      setEvents(mergedEvents);

      if (mergedEvents.length === 0) {
        setEventId("");
        return;
      }

      const hasPreselectedEvent = !!preselectId && mergedEvents.some((event) => event.id === preselectId);
      setEventId(hasPreselectedEvent ? preselectId! : mergedEvents[0].id);
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, [preselectId]);

  const event = useMemo(() => events.find((item) => item.id === eventId) ?? null, [eventId, events]);
  const unit = useMemo(() => (event ? priceFor(type, event.basePrice) : 0), [event, type]);
  const subtotal = useMemo(() => unit * qty, [unit, qty]);
  const tax = useMemo(() => subtotal * 0.1025, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  function addTicketsToCart() {
    if (!event) return;

    const cart = getCart();
    const itemId = `ticket-${event.id}-${type.toLowerCase()}`;
    const title = `${event.title} - ${type} Ticket`;
    const existing = cart.find((item) => item.id === itemId);

    if (existing) {
      existing.qty += qty;
      if (!existing.image && event.image) {
        existing.image = event.image;
      }
    } else {
      cart.push({
        id: itemId,
        title,
        price: unit,
        qty,
        image: event.image,
      });
    }

    setCart(cart);
    setToast("Tickets added to cart");
    window.setTimeout(() => setToast(""), 1200);
  }

  return (
    <div className="customer-subpage-shell">
      <SideBar />

      <main className="tickets-page customer-subpage-main">
        <section className="tickets-hero customer-subpage-hero">
          <div>
            <h1>Buy Tickets</h1>
            <p className="muted">Choose an exhibition, ticket type, and quantity.</p>
          </div>
        </section>

        <div className="tickets-grid">
          <div className="tickets-card customer-panel">
            <h3>Ticket Details</h3>

            <label>
              Exhibition
              <select
                className="customer-select"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                disabled={events.length === 0}
              >
                {events.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} - {item.museum}
                  </option>
                ))}
              </select>
            </label>

            <div className="mini muted">
              {event
                ? `${event.museum} • ${event.city} • ${formatDate(event.startDate)} - ${formatDate(event.endDate)}`
                : "Loading exhibitions..."}
            </div>

            <div className="row2">
              <label>
                Ticket type
                <select className="customer-select" value={type} onChange={(e) => setType(e.target.value as TicketType)}>
                  <option value="General">General</option>
                  <option value="Student">Student</option>
                  <option value="VIP">VIP</option>
                </select>
              </label>

              <label>
                Quantity
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.min(20, Number(e.target.value))))}
                />
              </label>
            </div>

            <div className="note muted">
              Student tickets require valid ID at entry. VIP includes priority entry + guided segment.
            </div>
          </div>

          <aside className="tickets-summary customer-panel">
            <h3>Summary</h3>

            <div className="sum-row">
              <span>Unit price</span>
              <span>${unit.toFixed(2)}</span>
            </div>

            <div className="sum-row">
              <span>Qty</span>
              <span>{qty}</span>
            </div>

            <div className="sum-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="sum-row">
              <span>Estimated tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className="sum-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button className="btn btn-primary" onClick={addTicketsToCart} disabled={!event}>
              Add tickets to cart
            </button>

            <button className="btn btn-ghost" onClick={() => nav("/customer/cart")}>
              Go to cart
            </button>
          </aside>
        </div>

        {toast && <div className="toast">{toast}</div>}
      </main>
    </div>
  );
}
