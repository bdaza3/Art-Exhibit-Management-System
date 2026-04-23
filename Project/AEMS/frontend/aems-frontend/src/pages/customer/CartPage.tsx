import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageTopBar from "../../components/PageTopBar";
import SideBar from "../../components/customer/SideBar";
import "./CartPage.css";
import "./CustomerSubpage.css";

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
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  const [initialized, setInitialized] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setInitialized(true);
  }, []);

  useEffect(() => {
    setItems(loadCart());
  }, [location]);

  useEffect(() => {
    if (!initialized) return;
    saveCart(items);
  }, [items, initialized]);

  useEffect(() => {
    const refresh = () => setItems(loadCart());
    window.addEventListener("cart_updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("cart_updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items]);
  const tax = useMemo(() => subtotal * 0.1025, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  function inc(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)));
  }

  function dec(id: string) {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: Math.max(1, item.qty - 1) } : item))
        .filter((item) => item.qty > 0)
    );
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clear() {
    setItems([]);
  }

  function checkout() {
    if (items.length === 0) return;
    navigate("/customer/payments");
  }

  return (
    <div className="customer-subpage-shell">
      <SideBar />

      <main className="cart-page customer-subpage-main">

        <section className="cart-header customer-subpage-hero">
          <div>
            <h1>Your Cart</h1>
            <p className="muted">Review artworks and tickets before continuing to secure checkout.</p>
          </div>
          {items.length > 0 && (
            <button className="btn btn-ghost" onClick={clear}>
              Clear cart
            </button>
          )}
        </section>

        {items.length === 0 ? (
          <div className="cart-empty customer-empty">
            <p>Your cart is empty.</p>
            <p className="muted">Add artworks or tickets to see them here.</p>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="thumb">
                    {item.image ? <img src={item.image} alt={item.title} /> : <div className="thumb-placeholder" />}
                  </div>

                  <div className="meta">
                    <div className="title">{item.title}</div>
                    {item.artist && <div className="muted">{item.artist}</div>}
                    <div className="price">${item.price.toFixed(2)}</div>
                  </div>

                  <div className="qty">
                    <button className="btn btn-square" onClick={() => dec(item.id)}>
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button className="btn btn-square" onClick={() => inc(item.id)}>
                      +
                    </button>
                  </div>

                  <div className="line-total">${(item.price * item.qty).toFixed(2)}</div>

                  <button className="btn btn-ghost danger" onClick={() => remove(item.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <aside className="cart-summary customer-panel">
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

              <p className="muted tiny">Payments can later route to your "Make Payments" flow / Stripe.</p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
