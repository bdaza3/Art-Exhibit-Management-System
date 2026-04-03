import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MakePaymentsPage.css";

type CartItem = {
  id: string;
  title: string;
  artist?: string;
  price: number;
  image?: string;
  qty: number;
};

const CART_KEY = "aems_cart";

function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function MakePaymentsPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"card" | "paypal" | "applepay">("card");
  const [processing, setProcessing] = useState(false);

  // simple controlled card inputs (UI only)
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");

  const items = useMemo(() => loadCart(), []);
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items]
  );
  const tax = useMemo(() => subtotal * 0.1025, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const isEmpty = items.length === 0;

  async function payNow() {
    if (isEmpty) return;
    setProcessing(true);

    // Build a minimal payload to send to the backend if available
    const payload = {
      method,
      card: { cardName, cardNumber, expiry, cvv, zip },
      items,
      total,
    };

    try {
      // Try to call a backend payments endpoint if present
      const res = await fetch("/api/payments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (res.ok) {
        // backend handled payment
        localStorage.setItem(CART_KEY, JSON.stringify([]));
        window.dispatchEvent(new Event("cart_updated"));
        navigate("/customer");
      } else {
        // fallback UI flow: if backend missing or errored, simulate success
        const text = await res.text().catch(() => "");
        console.warn("Payments endpoint error:", res.status, text);
        alert("Payment processed (simulated). Backend returned an error.");
        localStorage.setItem(CART_KEY, JSON.stringify([]));
        window.dispatchEvent(new Event("cart_updated"));
        navigate("/customer");
      }
    } catch (err) {
      // network or endpoint not present — simulate a friendly payment success
      console.warn("Payment call failed, simulating success:", err);
      alert("Payment successful (simulated). Connect backend for real payments.");
      localStorage.setItem(CART_KEY, JSON.stringify([]));
      window.dispatchEvent(new Event("cart_updated"));
      navigate("/customer");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="pay-page">
      <div className="pay-header">
        <div>
          <h2>Make Payments</h2>
          <p className="muted">Complete checkout securely.</p>
        </div>

        <div className="pay-header-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/cart")}>
            Back to cart
          </button>
          <button className="btn" onClick={() => navigate("/customer")}>
            Home
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="pay-empty">
          <h3>Your cart is empty</h3>
          <p className="muted">Add artworks or tickets before paying.</p>
          <button className="btn btn-primary" onClick={() => navigate("/customer")}>
            Go to dashboard
          </button>
        </div>
      ) : (
        <div className="pay-grid">
          <div className="pay-card">
            <h3>Payment Method</h3>

            <div className="method-row">
              <label className={`method ${method === "card" ? "active" : ""}`}>
                <input
                  type="radio"
                  checked={method === "card"}
                  onChange={() => setMethod("card")}
                />
                Credit / Debit Card
              </label>

              <label className={`method ${method === "paypal" ? "active" : ""}`}>
                <input
                  type="radio"
                  checked={method === "paypal"}
                  onChange={() => setMethod("paypal")}
                />
                PayPal
              </label>

              <label className={`method ${method === "applepay" ? "active" : ""}`}>
                <input
                  type="radio"
                  checked={method === "applepay"}
                  onChange={() => setMethod("applepay")}
                />
                Apple Pay
              </label>
            </div>

            {method === "card" && (
              <div className="form">
                <div className="grid2">
                  <label>
                    Cardholder name
                    <input placeholder="Username" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                  </label>

                  <label>
                    Card number
                    <input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                  </label>
                </div>

                <div className="grid3">
                  <label>
                    Expiry
                    <input placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                  </label>
                  <label>
                    CVV
                    <input placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value)} />
                  </label>
                  <label>
                    ZIP
                    <input placeholder="60607" value={zip} onChange={(e) => setZip(e.target.value)} />
                  </label>
                </div>

                <p className="muted tiny">
                  This is a UI placeholder. Later connect to Stripe.
                </p>
              </div>
            )}

            {method !== "card" && (
              <div className="alt-box muted">
                You’ll be redirected to {method.toUpperCase()} (placeholder).
              </div>
            )}
          </div>

          <aside className="pay-summary">
            <h3>Order Summary</h3>
            <div style={{ marginTop: 8 }}>
              {items.map((it) => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <div style={{ maxWidth: 220 }}>{it.title} x{it.qty}</div>
                  <div style={{ fontWeight: 600 }}>{formatMoney(it.price * it.qty)}</div>
                </div>
              ))}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8, paddingTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="muted">Subtotal</div>
                  <div>{formatMoney(subtotal)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="muted">Tax</div>
                  <div>{formatMoney(tax)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontWeight: 700 }}>
                  <div>Total</div>
                  <div>{formatMoney(total)}</div>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={payNow} disabled={processing} style={{ marginTop: 12 }}>
              {processing ? "Processing..." : `Pay ${formatMoney(total)}`}
            </button>

            <p className="muted tiny" style={{ marginTop: 8 }}>
              Secure checkout.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}