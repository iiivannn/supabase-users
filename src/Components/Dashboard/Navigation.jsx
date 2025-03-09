import { useNavigate } from "react-router-dom";
import logo from "../../assets/parsafe_logo.png";
import { supabase } from "../../supabase";
import "./Dashboard.css";

export default function Navigation({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      console.log(`User logged out: ${user.user_metadata.username}`);
    }
    await onLogout(); // Call the logout method passed from App
    navigate("/login"); // Explicitly navigate to login page
  };

  return (
    <div className="navigation">
      <img className="logo_img" src={logo} alt="ParSafe Logo" />

      <div className="upper_menu">
        <h2>Quick Menu</h2>
        <button className="link-button" onClick={() => navigate("/")}>
          Dashboard
        </button>
        <button className="link-button" onClick={() => navigate("/orders")}>
          My Orders
        </button>
      </div>

      <div className="lower_menu">
        <h2>Settings</h2>
        <button className="link-button" onClick={() => navigate("/account")}>
          Account
        </button>
        <button className="link-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
