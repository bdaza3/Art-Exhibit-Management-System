import "./ProfilePage.css";
import { Link } from "react-router-dom";

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
	return (
		<div className="profile-bg">
			<nav className="nav">
				<div className="logo">AEMS</div>
				<div className="nav-links">
					<Link to="/customer">Home</Link>
					<a>Exhibitions</a>
					<a>Artists</a>
					<a>Contact</a>
				</div>
			</nav>

			<div className="profile-card">
				<h2 className="profile-title">Your Gallery Profile</h2>
				<p className="profile-subtitle">
					Curate your presence in the Art Exhibition Management System.
				</p>

				<div className="profile-grid">
					<div className="profile-section">
						<h3>Account Details</h3>
						<p className="profile-label">Name</p>
						<p className="profile-value">John Doe</p>

						<p className="profile-label">Role</p>
						<p className="profile-value">Customer</p>
					</div>

					<div className="profile-section">
						<h3>Preferences</h3>
						<p className="profile-value">
							Favorite styles: Abstract, Modern, Contemporary
						</p>
						<p className="profile-value">
							Notifications: Enabled
						</p>
					</div>
				</div>

				<button className="profile-btn">Edit Profile</button>

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
	);
}
