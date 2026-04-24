import { useEffect, useState } from "react";
import "./ProfilePage.css";
import SideBar from "../components/customer/SideBar";

const API_BASE = "http://localhost:8000/api/auth";
const ORDERS_API = "http://127.0.0.1:8000/api/orders/";

type OrderHistoryItem = {
	id: number;
	artwork_title?: string;
	user_name?: string;
	created_at?: string;
	total_price?: number;
	total?: number;
	status?: string;
};

function formatMoney(value: number) {
	return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(value?: string) {
	if (!value) return "Unknown date";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Unknown date";
	return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export default function ProfilePage() {
	const [profile, setProfile] = useState({
		username: "",
		email: "",
		first_name: "",
		last_name: "",
		role: "",
	});
	const [transactions, setTransactions] = useState<OrderHistoryItem[]>([]);
	const [txLoading, setTxLoading] = useState(true);
	const [txError, setTxError] = useState("");
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState(profile);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	useEffect(() => {
		fetch(`${API_BASE}/profile/`, { credentials: "include" })
			.then((res) => {
				if (!res.ok) throw new Error("Not authenticated");
				return res.json();
			})
			.then((data) => {
				setProfile(data);
				setForm(data);

				const currentUsername = data?.username || localStorage.getItem("username") || "";
				setTxLoading(true);
				setTxError("");
				return fetch(ORDERS_API, { credentials: "include" })
					.then((res) => {
						if (!res.ok) throw new Error("Could not load transactions");
						return res.json();
					})
					.then((orders) => {
						const list = Array.isArray(orders) ? orders : [];
						const filtered = list
							.filter((item: OrderHistoryItem) => !currentUsername || item.user_name === currentUsername)
							.sort((a: OrderHistoryItem, b: OrderHistoryItem) => {
								const aTime = new Date(a.created_at || 0).getTime();
								const bTime = new Date(b.created_at || 0).getTime();
								return bTime - aTime;
							})
							.slice(0, 8);

						setTransactions(filtered);
					})
					.catch(() => setTxError("Could not load recent transactions"))
					.finally(() => setTxLoading(false));
			})
			.catch(() => setError("Could not load profile"));
	}, []);

	const handleSave = async () => {
		setError("");
		setSuccess("");
		try {
			const res = await fetch(`${API_BASE}/profile/`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					username: form.username,
					email: form.email,
					first_name: form.first_name,
					last_name: form.last_name,
				}),
			});
			if (!res.ok) {
				const data = await res.json();
				const firstError = Object.values(data).flat()[0];
				setError(typeof firstError === "string" ? firstError : "Update failed");
				return;
			}
			const updated = await res.json();
			setProfile(updated);
			setForm(updated);
			setEditing(false);
			setSuccess("Profile updated!");

			// Keep localStorage in sync
			const stored = JSON.parse(localStorage.getItem("user") || "{}");
			localStorage.setItem("user", JSON.stringify({ ...stored, username: updated.username, email: updated.email, role: updated.role }));
			localStorage.setItem("username", updated.username);
		} catch {
			setError("Could not connect to server");
		}
	};

	return (
		<div style={{ display: "flex" }}>
			<SideBar />
			<div className="profile-bg">
				<div className="profile-card">
				<div className="profile-header">
					<div className="profile-avatar">
						{(profile.first_name?.[0] || profile.username?.[0] || "?").toUpperCase()}
						{(profile.last_name?.[0] || "").toUpperCase()}
					</div>
					<div className="profile-header-info">
						<h2 className="profile-title">
							{profile.first_name && profile.last_name
								? `${profile.first_name} ${profile.last_name}`
								: profile.username || "Your Profile"}
						</h2>
						<span className="profile-role-badge">{profile.role}</span>
					</div>
				</div>

				<p className="profile-subtitle">
					Curate your presence in the Art Exhibition Management System.
				</p>

				{error && <p className="profile-msg profile-msg-error">{error}</p>}
				{success && <p className="profile-msg profile-msg-success">{success}</p>}

				<div className="profile-details-card">
					<h3 className="profile-details-heading">Account Details</h3>

					<div className="profile-fields">
						<div className="profile-field">
							<span className="profile-label">Username</span>
							{editing ? (
								<input className="profile-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
							) : (
								<span className="profile-value">{profile.username}</span>
							)}
						</div>

						<div className="profile-field">
							<span className="profile-label">First Name</span>
							{editing ? (
								<input className="profile-input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
							) : (
								<span className="profile-value">{profile.first_name || "N/A"}</span>
							)}
						</div>

						<div className="profile-field">
							<span className="profile-label">Last Name</span>
							{editing ? (
								<input className="profile-input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
							) : (
								<span className="profile-value">{profile.last_name || "N/A"}</span>
							)}
						</div>

						<div className="profile-field">
							<span className="profile-label">Email</span>
							{editing ? (
								<input className="profile-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
							) : (
								<span className="profile-value">{profile.email || "N/A"}</span>
							)}
						</div>
					</div>
				</div>

				<div className="profile-actions">
					{editing ? (
						<>
							<button className="profile-btn profile-btn-save" onClick={handleSave}>Save Changes</button>
							<button className="profile-btn profile-btn-cancel" onClick={() => { setEditing(false); setForm(profile); setError(""); }}>Cancel</button>
						</>
					) : (
						<button className="profile-btn" onClick={() => setEditing(true)}>Edit Profile</button>
					)}
				</div>

				<div className="transactions-section">
					<h3 className="transactions-title">Recent Gallery Transactions</h3>
					<p className="transactions-subtitle">
						Your latest completed purchases from transaction history.
					</p>

					<div className="transactions-list">
						{txLoading && <p className="transactions-subtitle">Loading transactions...</p>}
						{!txLoading && txError && <p className="transactions-subtitle">{txError}</p>}
						{!txLoading && !txError && transactions.length === 0 && (
							<p className="transactions-subtitle">No transactions yet.</p>
						)}

						{!txLoading && !txError && transactions.map((tx) => {
							const total = Number(tx.total_price ?? tx.total ?? 0);
							return (
								<div key={tx.id} className="transaction-item">
									<div className="transaction-main">
										<p className="transaction-artwork">{tx.artwork_title || "Untitled purchase"}</p>
										<p className="transaction-artist">Status: {tx.status || "Paid"}</p>
									</div>
									<div className="transaction-meta">
										<p className="transaction-buyer">Buyer: {tx.user_name || profile.username || "Unknown"}</p>
										<p className="transaction-date">{formatDate(tx.created_at)}</p>
										<p className="transaction-price">{formatMoney(total)}</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
		</div>
	);
}
