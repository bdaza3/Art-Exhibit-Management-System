import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CartPage.css";

type CartItem = {
  id: string;
  title: string;
  artist?: string;
  price: number;
  image?: string;
  qty: number;
};

const STORAGE_KEY = "aems_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function CartPage() {
  // ✅ initialize from localStorage immediately (prevents empty overwrite)
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  // ✅ used to prevent saving before the first proper load
  const [initialized, setInitialized] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ mark initialized after first mount
  useEffect(() => {
    setInitialized(true);
  }, []);

  // ✅ whenever the route changes, re-load cart from localStorage
  // (helps with browser back button + navigation)
  useEffect(() => {
    setItems(loadCart());
  }, [location]);

  // ✅ save cart ONLY after initialization
  useEffect(() => {
    if (!initialized) return;
    saveCart(items);
  }, [items, initialized]);

  // ✅ listen for custom event fired by ViewBuyArtPage
  useEffect(() => {
    const refresh = () => setItems(loadCart());

    window.addEventListener("cart_updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("cart_updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items]
  );

  const tax = useMemo(() => subtotal * 0.1025, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  function inc(id: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it))
    );
  }

  function dec(id: string) {
    setItems((prev) =>
      prev
        .map((it) =>
          it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it
        )
        .filter((it) => it.qty > 0)
    );
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function clear() {
    setItems([]);
  }

  function checkout() {
    // route to payments page (MakePaymentsPage) which contains the checkout flow
    if (items.length === 0) return;
    navigate("/customer/payments");
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>Cart</h2>
        {items.length > 0 && (
          <button className="btn btn-ghost" onClick={clear}>
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <p className="muted">Add artworks or tickets to see them here.</p>
        </div>
      ) : (
        <div className="cart-grid">
          <div className="cart-items">
            {items.map((it) => (
              <div className="cart-item" key={it.id}>
                <div className="thumb">
                  {it.image ? (
                    <img src={it.image} alt={it.title} />
                  ) : (
                    <div className="thumb-placeholder" />
                  )}
                </div>

                <div className="meta">
                  <div className="title">{it.title}</div>
                  {it.artist && <div className="muted">{it.artist}</div>}
                  <div className="price">${it.price.toFixed(2)}</div>
                </div>

                <div className="qty">
                  <button className="btn btn-square" onClick={() => dec(it.id)}>
                    -
                  </button>
                  <span>{it.qty}</span>
                  <button className="btn btn-square" onClick={() => inc(it.id)}>
                    +
                  </button>
                </div>

                <div className="line-total">
                  ${(it.price * it.qty).toFixed(2)}
                </div>

                <button className="btn btn-ghost danger" onClick={() => remove(it.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>Order Summary</h3>
            <div className="row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="row">
              <span>Estimated tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button className="btn btn-primary" onClick={checkout}>
              Checkout
            </button>

            <p className="muted tiny">
              Payments can later route to your “Make Payments” flow / Stripe.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}