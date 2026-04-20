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
const ORDERS_API = "http://127.0.0.1:8000/api/orders/";

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
  const [paymentError, setPaymentError] = useState("");

  const items = useMemo(() => loadCart(), []);
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items]
  );
  const tax = useMemo(() => subtotal * 0.1025, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const isEmpty = items.length === 0;

  function validateCardDetails() {
    if (method !== "card") return "";

    const cleanCardNumber = cardNumber.replace(/\s+/g, "");
    const cleanCvv = cvv.trim();
    const cleanZip = zip.trim();

    if (!cardName.trim()) return "Please enter the cardholder name.";
    if (!/^\d{13,19}$/.test(cleanCardNumber)) return "Please enter a valid card number.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.trim())) return "Please enter expiry as MM/YY.";
    if (!/^\d{3,4}$/.test(cleanCvv)) return "Please enter a valid CVV.";
    if (!/^\d{5}(-\d{4})?$/.test(cleanZip)) return "Please enter a valid ZIP code.";

    return "";
  }

  async function payNow() {
    if (isEmpty) return;

    const validationMessage = validateCardDetails();
    if (validationMessage) {
      setPaymentError(validationMessage);
      return;
    }

    setPaymentError("");
    setProcessing(true);

    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const payload = {
      method,
      items,
      total,
      customer_username: savedUser.username || localStorage.getItem("username") || "guest_customer",
      customer: {
        username: savedUser.username || localStorage.getItem("username") || "guest_customer",
        email: savedUser.email || "",
      },
    };

    try {
      const res = await fetch(ORDERS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Order save failed: ${res.status} ${text}`);
      }

      alert("Payment successful. Your order was sent to admin.");
      localStorage.setItem(CART_KEY, JSON.stringify([]));
      window.dispatchEvent(new Event("cart_updated"));
      navigate("/customer");
    } catch (err) {
      console.error("Order creation failed:", err);
      alert("Payment could not be completed because the order was not saved. Please make sure the backend is running.");
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
                    <input
                      placeholder="Username"
                      value={cardName}
                      onChange={(e) => {
                        setCardName(e.target.value);
                        setPaymentError("");
                      }}
                      required
                    />
                  </label>

                  <label>
                    Card number
                    <input
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => {
                        setCardNumber(e.target.value);
                        setPaymentError("");
                      }}
                      required
                    />
                  </label>
                </div>

                <div className="grid3">
                  <label>
                    Expiry
                    <input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => {
                        setExpiry(e.target.value);
                        setPaymentError("");
                      }}
                      required
                    />
                  </label>
                  <label>
                    CVV
                    <input
                      inputMode="numeric"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => {
                        setCvv(e.target.value);
                        setPaymentError("");
                      }}
                      required
                    />
                  </label>
                  <label>
                    ZIP
                    <input
                      inputMode="numeric"
                      placeholder="60607"
                      value={zip}
                      onChange={(e) => {
                        setZip(e.target.value);
                        setPaymentError("");
                      }}
                      required
                    />
                  </label>
                </div>

                {paymentError && <p className="payment-error">{paymentError}</p>}

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

            {method !== "card" && paymentError && <p className="payment-error">{paymentError}</p>}
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
