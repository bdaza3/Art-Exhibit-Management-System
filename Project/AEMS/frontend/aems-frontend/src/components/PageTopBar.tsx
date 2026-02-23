import { useNavigate } from "react-router-dom";
import "./PageTopBar.css";

export default function PageTopBar({ title }: { title: string }) {
  const navigate = useNavigate();

  return (
    <div className="page-topbar">
      <div className="topbar-left">
        <button
          className="topbar-home"
          onClick={() => navigate("/customer")}
        >
          🏠 Home
        </button>
      </div>

      <div className="topbar-title">
        {title}
      </div>
    </div>
  );
}