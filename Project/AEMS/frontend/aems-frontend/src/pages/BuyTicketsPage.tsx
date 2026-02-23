import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BuyTicketsPage.css";
import PageTopBar from "../components/PageTopBar";

type TicketType = "General" | "Student" | "VIP";

type TicketEvent = {
  id: string;
  title: string;
  museum: string;
  city: string;
  startDate: string;
  endDate: string;
  basePrice: number; // general
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

// Keep events list here too (later import from a shared file / API)
const EVENTS: TicketEvent[] = [
  { id: "ev-201", title: "Impressionist Light: Modern Echoes", museum: "The Art Institute of Chicago", city: "Chicago, IL", startDate: "2026-03-01", endDate: "2026-05-15", basePrice: 28 },
  { id: "ev-202", title: "Urban Noir: Shadows of the City", museum: "Museum of Contemporary Art", city: "Chicago, IL", startDate: "2026-03-12", endDate: "2026-06-20", basePrice: 22 },
  { id: "ev-203", title: "Still Water, Golden Air", museum: "National Gallery of Victoria", city: "Melbourne, AU", startDate: "2026-04-05", endDate: "2026-07-01", basePrice: 30 },
  {id: "ev-204", title: "Renaissance Reimagined: Digital Masters", museum: "The Louvre Digital Wing", city: "Paris, France", startDate: "2026-05-10", endDate: "2026-08-30", basePrice: 35},
  {id: "ev-205", title: "Sculpted Silence: Modern Minimalism", museum: "Museum of Modern Art (MoMA)", city: "New York, NY", startDate: "2026-06-01", endDate: "2026-09-15", basePrice: 26}
];

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
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BuyTicketsPage() {
  const nav = useNavigate();
  const location = useLocation() as any;

  const preselectId = location?.state?.eventId as string | undefined;

  const [eventId, setEventId] = useState(preselectId || EVENTS[0].id);
  const [type, setType] = useState<TicketType>("General");
  const [qty, setQty] = useState(2);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (preselectId) setEventId(preselectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ev = useMemo(() => EVENTS.find((e) => e.id === eventId)!, [eventId]);
  const unit = useMemo(() => priceFor(type, ev.basePrice), [type, ev.basePrice]);
  const subtotal = useMemo(() => unit * qty, [unit, qty]);
  const tax = useMemo(() => subtotal * 0.1025, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  function addTicketsToCart() {
    const cart = getCart();
    const itemId = `ticket-${ev.id}-${type.toLowerCase()}`;

    const title = `${ev.title} — ${type} Ticket`;
    const existing = cart.find((c) => c.id === itemId);

    if (existing) existing.qty += qty;
    else cart.push({ id: itemId, title, price: unit, qty });

    setCart(cart);
    setToast("Tickets added to cart");
    window.setTimeout(() => setToast(""), 1200);
  }

  return (
    <div className="tickets-page">
    <PageTopBar title="Buy Tickets" />
      <div className="tickets-hero">
        <div>
          <h2>Buy Tickets</h2>
          <p className="muted">Choose an exhibition, ticket type, and quantity.</p>
        </div>

        <button className="btn btn-ghost" onClick={() => nav("/customer/events")}>
          Back to events
        </button>
      </div>

      <div className="tickets-grid">
        <div className="tickets-card">
          <h3>Ticket Details</h3>

          <label>
            Exhibition
            <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
              {EVENTS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} — {e.museum}
                </option>
              ))}
            </select>
          </label>

          <div className="mini muted">
            {ev.museum} • {ev.city} • {formatDate(ev.startDate)} – {formatDate(ev.endDate)}
          </div>

          <div className="row2">
            <label>
              Ticket type
              <select value={type} onChange={(e) => setType(e.target.value as TicketType)}>
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

        <aside className="tickets-summary">
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

          <button className="btn btn-primary" onClick={addTicketsToCart}>
            Add tickets to cart
          </button>

          <button className="btn btn-ghost" onClick={() => nav("/customer/cart")}>
            Go to cart
          </button>

          <p className="muted tiny">Payments can later route to Stripe in your “Make Payments” flow.</p>
        </aside>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}