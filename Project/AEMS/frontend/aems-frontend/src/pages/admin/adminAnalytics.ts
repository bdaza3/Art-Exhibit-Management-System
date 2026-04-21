export type RangeKey = "7d" | "30d" | "90d" | "ytd";
export type ReportCategory = "All" | "Art Sales" | "Tickets" | "Auctions";

export type OrderRecord = {
  id: number;
  customer?: string;
  total?: number;
  total_price?: number;
  status?: string;
  created_at?: string;
  artwork_title?: string;
  quantity?: number;
  items?: Array<{ title?: string; qty?: number; price?: number }>;
};

export type ArtworkRecord = {
  id: number;
  title: string;
  artist?: string;
  price?: number;
  category?: string;
  status?: string;
  image?: string;
};

export type BidRecord = {
  id: number;
  amount?: number;
  timestamp?: string;
  user?: { id?: number | null; username?: string | null } | null;
  anonymous?: boolean;
};

export type AuctionRecord = {
  id: number;
  status?: string;
  created_at?: string;
  start_time?: string;
  end_time?: string;
  starting_bid?: number;
  artwork?: ArtworkRecord;
  bids?: BidRecord[];
};

export type ExhibitionRecord = {
  id: number;
  title: string;
  date?: string;
  venue?: string;
  location?: string;
  image?: string;
};

export type AnalyticsBundle = {
  orders: OrderRecord[];
  artworks: ArtworkRecord[];
  auctions: AuctionRecord[];
  exhibitions: ExhibitionRecord[];
};

export type KPIStat = {
  value: number;
  delta: number;
};

export type DashboardMetrics = {
  revenue: KPIStat;
  orders: KPIStat;
  tickets: KPIStat;
  customers: KPIStat;
  activeAuctions: number;
  averageOrderValue: number;
  soldArtworks: number;
  upcomingExhibitions: number;
};

export type TrendPoint = {
  key: string;
  label: string;
  value: number;
};

export type RankedItem = {
  name: string;
  sub: string;
  value: number;
};

export type ActivityItem = {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  amount?: number;
  status: "Success" | "Pending" | "Failed";
  type: "Order" | "Ticket" | "Auction";
};

const API_ROOT = "http://127.0.0.1:8000/api";

export async function fetchAdminAnalyticsData(): Promise<AnalyticsBundle> {
  const [orders, artworks, auctions, exhibitions] = await Promise.all([
    fetchCollection<OrderRecord>(`${API_ROOT}/orders/`),
    fetchCollection<ArtworkRecord>(`${API_ROOT}/artworks/`),
    fetchCollection<AuctionRecord>(`${API_ROOT}/auctions/`),
    fetchCollection<ExhibitionRecord>(`${API_ROOT}/exhibitions/`),
  ]);

  return { orders, artworks, auctions, exhibitions };
}

async function fetchCollection<T>(url: string): Promise<T[]> {
  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.warn(`Failed to fetch ${url}`, error);
    return [];
  }
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getRangeStart(range: RangeKey) {
  const today = startOfToday();

  if (range === "ytd") {
    return new Date(today.getFullYear(), 0, 1);
  }

  const days = range === "7d" ? 6 : range === "30d" ? 29 : 89;
  const start = new Date(today);
  start.setDate(today.getDate() - days);
  return start;
}

function getPreviousRangeStart(range: RangeKey) {
  const currentStart = getRangeStart(range);
  const spanMs = startOfToday().getTime() - currentStart.getTime();
  return new Date(currentStart.getTime() - spanMs - 24 * 60 * 60 * 1000);
}

function getPreviousRangeEnd(range: RangeKey) {
  const currentStart = getRangeStart(range);
  const end = new Date(currentStart);
  end.setDate(currentStart.getDate() - 1);
  end.setHours(23, 59, 59, 999);
  return end;
}

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function inWindow(date: Date | null, start: Date, end: Date) {
  if (!date) return false;
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

function normalizeTitle(order: OrderRecord) {
  return (
    order.artwork_title ||
    order.items?.[0]?.title ||
    `Order #${order.id}`
  );
}

function normalizeQuantity(order: OrderRecord) {
  const itemQty = order.items?.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  return itemQty || Number(order.quantity || 1);
}

function orderAmount(order: OrderRecord) {
  return Number(order.total ?? order.total_price ?? 0);
}

export function isTicketOrder(order: OrderRecord) {
  const title = normalizeTitle(order).toLowerCase();
  return title.includes("ticket");
}

function highestBidAmount(auction: AuctionRecord) {
  const bids = Array.isArray(auction.bids) ? auction.bids : [];
  if (bids.length === 0) return Number(auction.starting_bid || 0);
  return Math.max(...bids.map((bid) => Number(bid.amount || 0)));
}

function auctionParticipants(auction: AuctionRecord) {
  const bids = Array.isArray(auction.bids) ? auction.bids : [];
  return new Set(
    bids
      .map((bid) => bid.user?.username || (bid.anonymous ? "Anonymous" : null))
      .filter(Boolean)
  ).size;
}

function computeDelta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function filterOrdersForCategory(orders: OrderRecord[], category: ReportCategory) {
  if (category === "Tickets") return orders.filter(isTicketOrder);
  if (category === "Art Sales") return orders.filter((order) => !isTicketOrder(order));
  return orders;
}

export function buildDashboardMetrics(bundle: AnalyticsBundle, range: RangeKey): DashboardMetrics {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const currentStart = getRangeStart(range);
  const previousStart = getPreviousRangeStart(range);
  const previousEnd = getPreviousRangeEnd(range);

  const currentOrders = bundle.orders.filter((order) => inWindow(parseDate(order.created_at), currentStart, today));
  const previousOrders = bundle.orders.filter((order) => inWindow(parseDate(order.created_at), previousStart, previousEnd));

  const currentTicketOrders = currentOrders.filter(isTicketOrder);
  const previousTicketOrders = previousOrders.filter(isTicketOrder);

  const currentRevenue = currentOrders.reduce((sum, order) => sum + orderAmount(order), 0);
  const previousRevenue = previousOrders.reduce((sum, order) => sum + orderAmount(order), 0);

  const currentTickets = currentTicketOrders.reduce((sum, order) => sum + normalizeQuantity(order), 0);
  const previousTickets = previousTicketOrders.reduce((sum, order) => sum + normalizeQuantity(order), 0);

  const currentCustomers = new Set(currentOrders.map((order) => order.customer).filter(Boolean)).size;
  const previousCustomers = new Set(previousOrders.map((order) => order.customer).filter(Boolean)).size;

  const upcomingExhibitions = bundle.exhibitions.filter((exhibition) => {
    const date = parseDate(exhibition.date);
    return date && date >= startOfToday();
  }).length;

  return {
    revenue: { value: currentRevenue, delta: computeDelta(currentRevenue, previousRevenue) },
    orders: { value: currentOrders.length, delta: computeDelta(currentOrders.length, previousOrders.length) },
    tickets: { value: currentTickets, delta: computeDelta(currentTickets, previousTickets) },
    customers: { value: currentCustomers, delta: computeDelta(currentCustomers, previousCustomers) },
    activeAuctions: bundle.auctions.filter((auction) => auction.status === "active").length,
    averageOrderValue: currentOrders.length ? currentRevenue / currentOrders.length : 0,
    soldArtworks: bundle.artworks.filter((artwork) => artwork.status === "sold").length,
    upcomingExhibitions,
  };
}

export function buildReportMetrics(bundle: AnalyticsBundle, range: RangeKey, category: ReportCategory) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const currentStart = getRangeStart(range);
  const previousStart = getPreviousRangeStart(range);
  const previousEnd = getPreviousRangeEnd(range);

  const currentOrders = filterOrdersForCategory(
    bundle.orders.filter((order) => inWindow(parseDate(order.created_at), currentStart, today)),
    category
  );
  const previousOrders = filterOrdersForCategory(
    bundle.orders.filter((order) => inWindow(parseDate(order.created_at), previousStart, previousEnd)),
    category
  );

  const currentAuctions = bundle.auctions.filter((auction) => {
    const relevantDate = parseDate(auction.start_time || auction.created_at);
    return inWindow(relevantDate, currentStart, today);
  });
  const previousAuctions = bundle.auctions.filter((auction) => {
    const relevantDate = parseDate(auction.start_time || auction.created_at);
    return inWindow(relevantDate, previousStart, previousEnd);
  });

  if (category === "Auctions") {
    const currentRevenue = currentAuctions.reduce((sum, auction) => sum + highestBidAmount(auction), 0);
    const previousRevenue = previousAuctions.reduce((sum, auction) => sum + highestBidAmount(auction), 0);
    const currentCustomers = currentAuctions.reduce((sum, auction) => sum + auctionParticipants(auction), 0);
    const previousCustomers = previousAuctions.reduce((sum, auction) => sum + auctionParticipants(auction), 0);

    return {
      revenue: { value: currentRevenue, delta: computeDelta(currentRevenue, previousRevenue) },
      orders: { value: currentAuctions.length, delta: computeDelta(currentAuctions.length, previousAuctions.length) },
      tickets: { value: 0, delta: 0 },
      auctions: { value: bundle.auctions.filter((auction) => auction.status === "active").length, delta: 0 },
      customers: { value: currentCustomers, delta: computeDelta(currentCustomers, previousCustomers) },
    };
  }

  const currentRevenue = currentOrders.reduce((sum, order) => sum + orderAmount(order), 0);
  const previousRevenue = previousOrders.reduce((sum, order) => sum + orderAmount(order), 0);
  const currentTickets = currentOrders.filter(isTicketOrder).reduce((sum, order) => sum + normalizeQuantity(order), 0);
  const previousTickets = previousOrders.filter(isTicketOrder).reduce((sum, order) => sum + normalizeQuantity(order), 0);
  const currentCustomers = new Set(currentOrders.map((order) => order.customer).filter(Boolean)).size;
  const previousCustomers = new Set(previousOrders.map((order) => order.customer).filter(Boolean)).size;

  return {
    revenue: { value: currentRevenue, delta: computeDelta(currentRevenue, previousRevenue) },
    orders: { value: currentOrders.length, delta: computeDelta(currentOrders.length, previousOrders.length) },
    tickets: { value: currentTickets, delta: computeDelta(currentTickets, previousTickets) },
    auctions: { value: bundle.auctions.filter((auction) => auction.status === "active").length, delta: 0 },
    customers: { value: currentCustomers, delta: computeDelta(currentCustomers, previousCustomers) },
  };
}

export function buildTrendSeries(bundle: AnalyticsBundle, range: RangeKey, category: ReportCategory): TrendPoint[] {
  const today = startOfToday();
  const periodStart = getRangeStart(range);
  const useAuctions = category === "Auctions";
  const bucketCount = range === "7d" ? 7 : range === "30d" ? 6 : range === "90d" ? 6 : 12;
  const spanMs = today.getTime() - periodStart.getTime();
  const bucketMs = Math.max(24 * 60 * 60 * 1000, Math.ceil((spanMs + 24 * 60 * 60 * 1000) / bucketCount));

  const series = Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = new Date(periodStart.getTime() + index * bucketMs);
    const bucketEnd = new Date(Math.min(today.getTime() + 24 * 60 * 60 * 1000 - 1, bucketStart.getTime() + bucketMs - 1));
    const label = range === "ytd"
      ? bucketStart.toLocaleDateString("en-US", { month: "short" })
      : bucketStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    let value = 0;

    if (useAuctions) {
      value = bundle.auctions.reduce((sum, auction) => {
        const relevantDate = parseDate(auction.start_time || auction.created_at);
        return inWindow(relevantDate, bucketStart, bucketEnd) ? sum + highestBidAmount(auction) : sum;
      }, 0);
    } else {
      const orders = filterOrdersForCategory(bundle.orders, category);
      value = orders.reduce((sum, order) => {
        const orderDate = parseDate(order.created_at);
        return inWindow(orderDate, bucketStart, bucketEnd) ? sum + orderAmount(order) : sum;
      }, 0);
    }

    return {
      key: `${index}-${label}`,
      label,
      value,
    };
  });

  return series;
}

export function buildTopArtworks(bundle: AnalyticsBundle, range: RangeKey): RankedItem[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const currentStart = getRangeStart(range);
  const totals = new Map<string, { name: string; sub: string; value: number }>();

  bundle.orders
    .filter((order) => !isTicketOrder(order) && inWindow(parseDate(order.created_at), currentStart, today))
    .forEach((order) => {
      const title = normalizeTitle(order);
      const artwork = bundle.artworks.find((item) => item.title === title);
      const entry = totals.get(title) || {
        name: title,
        sub: artwork?.artist || "Artwork sale",
        value: 0,
      };
      entry.value += orderAmount(order);
      totals.set(title, entry);
    });

  return Array.from(totals.values())
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
}

export function buildTopExhibitions(bundle: AnalyticsBundle, range: RangeKey): RankedItem[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const currentStart = getRangeStart(range);
  const totals = new Map<string, RankedItem>();

  bundle.orders
    .filter((order) => isTicketOrder(order) && inWindow(parseDate(order.created_at), currentStart, today))
    .forEach((order) => {
      const title = normalizeTitle(order);
      const exhibition = bundle.exhibitions.find((item) => title.toLowerCase().includes(item.title.toLowerCase()));
      const key = exhibition?.title || title.replace(/\s+[-—]\s+.*ticket/i, "").trim();
      const entry = totals.get(key) || {
        name: key,
        sub: exhibition?.venue || "Ticket volume",
        value: 0,
      };
      entry.value += normalizeQuantity(order);
      totals.set(key, entry);
    });

  return Array.from(totals.values())
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
}

function orderStatusToActivity(status?: string): "Success" | "Pending" | "Failed" {
  if (status === "Pending") return "Pending";
  return status === "Paid" || status === "Shipped" ? "Success" : "Failed";
}

export function buildActivity(bundle: AnalyticsBundle, range: RangeKey): ActivityItem[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const currentStart = getRangeStart(range);

  const orderActivity: ActivityItem[] = bundle.orders
    .filter((order) => inWindow(parseDate(order.created_at), currentStart, today))
    .map((order) => ({
      id: `order-${order.id}`,
      timestamp: order.created_at || "",
      title: isTicketOrder(order) ? `Ticket order from ${order.customer || "Customer"}` : `Artwork order from ${order.customer || "Customer"}`,
      detail: normalizeTitle(order),
      amount: orderAmount(order),
      status: orderStatusToActivity(order.status),
      type: isTicketOrder(order) ? "Ticket" : "Order",
    }));

  const bidActivity: ActivityItem[] = bundle.auctions.flatMap((auction) =>
    (auction.bids || [])
      .filter((bid) => inWindow(parseDate(bid.timestamp), currentStart, today))
      .map((bid) => ({
        id: `bid-${bid.id}`,
        timestamp: bid.timestamp || "",
        title: `Bid placed on ${auction.artwork?.title || `Auction #${auction.id}`}`,
        detail: bid.user?.username || (bid.anonymous ? "Anonymous bidder" : "Auction activity"),
        amount: Number(bid.amount || 0),
        status: auction.status === "ended" ? "Success" : "Pending",
        type: "Auction" as const,
      }))
  );

  return [...orderActivity, ...bidActivity]
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, 8);
}

export function formatCurrency(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDelta(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
