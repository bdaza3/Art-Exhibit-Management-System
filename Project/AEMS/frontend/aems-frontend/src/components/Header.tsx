import { useNavigate } from "react-router-dom";
import "./PageTopBar.css";
import PersonIcon from '@mui/icons-material/Person';
import { Box } from "@mui/material";
import { ItemButton } from "./customer/ItemButton";

export default function PageTopBar({ title }: { title: string }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }} className="page-topbar">
      <div className="topbar-left">
        <div className="topbar-title">{title}</div>
      </div>

      <div className="topbar-right">
            <button style={{ marginRight: '10px', color: 'white' }} onClick={() => navigate("/customer/profile")}>
              <PersonIcon />
            </button>

        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
    </Box>
  );
}
