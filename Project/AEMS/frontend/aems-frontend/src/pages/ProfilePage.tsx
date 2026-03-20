import { useEffect, useState } from "react";
import "./ProfilePage.css";
import { Link } from "react-router-dom";
import SideBar from "../components/customer/SideBar";

const API_BASE = "http://localhost:8000/api/auth";

const mockTransactions = [
	{
		id: 1,
		artwork: "Golden Horizon",
		artist: "Amira K.",
		buyer: "Elena Rossi",
		date: "Jan 14, 2026",
		price: "$3,200",
	},
	{
		id: 2,
		artwork: "Silent Gallery",
		artist: "Marcus Lee",
		buyer: "Noah Patel",
		date: "Dec 02, 2025",
		price: "$1,850",
	},
	{
		id: 3,
		artwork: "Velvet Night",
		artist: "Sofia Marin",
		buyer: "Aya Tanaka",
		date: "Nov 19, 2025",
		price: "$4,600",
	},
];

export default function ProfilePage() {
	const [profile, setProfile] = useState({
		username: "",
		email: "",
		first_name: "",
		last_name: "",
		role: "",
	});
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
								<span className="profile-value">{profile.first_name || "—"}</span>
							)}
						</div>

						<div className="profile-field">
							<span className="profile-label">Last Name</span>
							{editing ? (
								<input className="profile-input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
							) : (
								<span className="profile-value">{profile.last_name || "—"}</span>
							)}
						</div>

						<div className="profile-field">
							<span className="profile-label">Email</span>
							{editing ? (
								<input className="profile-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
							) : (
								<span className="profile-value">{profile.email || "—"}</span>
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
						A curated record of artworks acquired by fellow collectors.
					</p>

					<div className="transactions-list">
						{mockTransactions.map((tx) => (
							<div key={tx.id} className="transaction-item">
								<div className="transaction-main">
									<p className="transaction-artwork">{tx.artwork}</p>
									<p className="transaction-artist">by {tx.artist}</p>
								</div>
								<div className="transaction-meta">
									<p className="transaction-buyer">Buyer: {tx.buyer}</p>
									<p className="transaction-date">{tx.date}</p>
									<p className="transaction-price">{tx.price}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
		</div>
	);
}
