import { useEffect, useMemo, useState } from "react";
import AdminSideBar from "../../components/admin/AdminSideBar";
import "./AdminDashboard.css";
import "./AdminArtworks.css";

type OrderItem = {
  title?: string;
  qty?: number;
  price?: number;
};

type Order = {
  id?: number;
  customer?: string;
  total?: number;
  total_price?: number;
  status?: string;
  created_at?: string;
  artwork_title?: string;
  quantity?: number;
  items?: OrderItem[];
};

type CustomerSummary = {
  name: string;
  orders: Order[];
  totalSpent: number;
  lastOrder?: string;
  purchasedItems: number;
};

const API_BASE = "http://127.0.0.1:8000/api/orders/";

const money = (value: number) => value.toFixed(2);

const orderTotal = (order: Order) => Number(order.total ?? order.total_price ?? 0);

const orderQuantity = (order: Order) => {
  const itemQty = order.items?.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  return itemQty || Number(order.quantity || 1);
};

const displayDate = (value?: string) => {
  if (!value) return "No order date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No order date" : date.toLocaleDateString();
};

export default function AdminCustomers() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(API_BASE, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const customers = useMemo(() => {
    const grouped = new Map<string, CustomerSummary>();

    orders.forEach((order) => {
      const name = order.customer?.trim() || "Guest Customer";
      const current = grouped.get(name) || {
        name,
        orders: [],
        totalSpent: 0,
        purchasedItems: 0,
      };

      current.orders.push(order);
      current.totalSpent += orderTotal(order);
      current.purchasedItems += orderQuantity(order);

      if (
        order.created_at &&
        (!current.lastOrder || new Date(order.created_at).getTime() > new Date(current.lastOrder).getTime())
      ) {
        current.lastOrder = order.created_at;
      }

      grouped.set(name, current);
    });

    return Array.from(grouped.values()).sort((left, right) => right.totalSpent - left.totalSpent);
  }, [orders]);

  const filteredCustomers = customers.filter((customer) => {
    const search = query.trim().toLowerCase();
    if (!search) return true;

    return (
      customer.name.toLowerCase().includes(search) ||
      customer.orders.some((order) =>
        (order.artwork_title || order.items?.[0]?.title || "").toLowerCase().includes(search)
      )
    );
  });

  const totalRevenue = filteredCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0);

  return (
    <div style={{ display: "flex" }}>
      <AdminSideBar />

      <div className="admin-page">
        <div className="dash-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Customers</h2>
            <div className="muted">View customer purchase activity from completed orders.</div>
          </div>
        </div>

        <div className="list-controls">
          <input
            className="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customers or purchased artwork"
          />
        </div>

        {loading ? (
          <p className="muted">Loading customers...</p>
        ) : (
          <>
            {filteredCustomers.length === 0 ? (
              <div className="pay-empty customer-empty">
                <h3>No customers found</h3>
                <p className="muted">No orders have been placed yet. Customers will appear here after checkout.</p>
              </div>
            ) : (
            <div className="auction-meta" style={{ marginBottom: 18 }}>
              <div className="auction-meta-tile">
                <div className="auction-meta-label">Customers</div>
                <div className="auction-meta-value">{filteredCustomers.length}</div>
              </div>
              <div className="auction-meta-tile">
                <div className="auction-meta-label">Orders</div>
                <div className="auction-meta-value">
                  {filteredCustomers.reduce((sum, customer) => sum + customer.orders.length, 0)}
                </div>
              </div>
              <div className="auction-meta-tile">
                <div className="auction-meta-label">Items Purchased</div>
                <div className="auction-meta-value">
                  {filteredCustomers.reduce((sum, customer) => sum + customer.purchasedItems, 0)}
                </div>
              </div>
              <div className="auction-meta-tile">
                <div className="auction-meta-label">Revenue</div>
                <div className="auction-meta-value">${money(totalRevenue)}</div>
              </div>
            </div>
            )}

            <div className="orders-grid">

              {filteredCustomers.map((customer) => (
                <div key={customer.name} className="order-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div className="art-title">{customer.name}</div>
                      <div className="art-artist">Last order: {displayDate(customer.lastOrder)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="art-price">${money(customer.totalSpent)}</div>
                      <div className="status-badge">{customer.orders.length} orders</div>
                    </div>
                  </div>

                  <div className="detail-list">
                    {customer.orders.slice(0, 3).map((order) => (
                      <div key={order.id || `${customer.name}-${order.created_at}`} className="detail-list-item">
                        <span>{order.artwork_title || order.items?.[0]?.title || `Order #${order.id || "new"}`}</span>
                        <span className="muted">${money(orderTotal(order))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
