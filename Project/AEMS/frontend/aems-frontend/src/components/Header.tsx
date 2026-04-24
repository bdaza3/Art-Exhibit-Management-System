import { useNavigate } from "react-router-dom";
import "./PageTopBar.css";
import PersonIcon from '@mui/icons-material/Person';

export default function PageTopBar({ title }: { title: string }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div className={`page-topbar dashboard-topbar${title ? "" : " is-compact"}`}>
      {title ? (
        <div className="topbar-left">
          <div className="topbar-title">{title}</div>
        </div>
      ) : null}

      <div className="topbar-right">
        <button className="profile-action-btn" onClick={() => navigate("/customer/profile")} aria-label="Open profile">
          <PersonIcon />
        </button>

        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
