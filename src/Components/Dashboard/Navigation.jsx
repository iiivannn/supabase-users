/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import logo from "../../assets/parsafe_logo.png";
import { useState } from "react";
import "./Dashboard.css";
import { supabase, secureLogout } from "../../supabase";

export default function Navigation({ onLogout, deviceId }) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    // Prevent multiple clicks
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      console.log("Logout initiated with deviceId:", deviceId);

      // Use the secureLogout function from supabase.js
      const { success, error } = await secureLogout(deviceId);

      if (!success) {
        console.error("Error during secure logout:", error);
        alert("Error signing out. Please try again.");
        return;
      }

      console.log("User signed out successfully");

      // Call the parent's onLogout function if it exists
      if (typeof onLogout === "function") {
        await onLogout();
      }

      // Navigate to login page
      navigate("/login");
    } catch (err) {
      console.error("Unexpected error during logout:", err);
      alert("An unexpected error occurred during logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="navigation">
      <img className="logo_img" src={logo} alt="ParSafe Logo" />

      <div className="menus">
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
          <button
            className="link-button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}
