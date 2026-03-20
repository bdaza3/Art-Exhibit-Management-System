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

    // Later: We will integrate and call backend/Stripe here
    setTimeout(() => {
      setProcessing(false);

     
      alert("Payment successful (placeholder)!");

     
      localStorage.setItem(CART_KEY, JSON.stringify([]));
      window.dispatchEvent(new Event("cart_updated"));

      navigate("/customer");
    }, 1200);
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
                    <input placeholder="Username" />
                  </label>

                  <label>
                    Card number
                    <input placeholder="1234 5678 9012 3456" />
                  </label>
                </div>

                <div className="grid3">
                  <label>
                    Expiry
                    <input placeholder="MM/YY" />
                  </label>
                  <label>
                    CVV
                    <input placeholder="123" />
                  </label>
                  <label>
                    ZIP
                    <input placeholder="60607" />
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

            <div className="summary-items">
              {items.map((it) => (
                <div className="summary-item" key={it.id}>
                  <div>
                    <div className="title">{it.title}</div>
                    <div className="muted tiny">
                      {it.artist ? `${it.artist} • ` : ""}
                      Qty {it.qty}
                    </div>
                  </div>
                  <div className="amt">{formatMoney(it.price * it.qty)}</div>
                </div>
              ))}
            </div>

            <div className="row">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="row">
              <span>Estimated tax</span>
              <span>{formatMoney(tax)}</span>
            </div>
            <div className="row total">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>

            <button
              className="btn btn-primary"
              onClick={payNow}
              disabled={processing}
            >
              {processing ? "Processing..." : `Pay ${formatMoney(total)}`}
            </button>

            <p className="muted tiny">
              Secure checkout UI • Stripe integration later
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}