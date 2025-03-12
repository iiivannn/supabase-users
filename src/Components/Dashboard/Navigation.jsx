import { useNavigate } from "react-router-dom";
import logo from "../../assets/parsafe_logo.png";
import { supabase } from "../../supabase";
import "./Dashboard.css";

export default function Navigation({ onLogout, deviceId }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Step 1: Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Step 2: Update the `unit_devices` table to set `user_id` and `username` to null
        const { error: updateError } = await supabase
          .from("unit_devices")
          .update({ user_id: null, username: null, isLogout: true })
          .eq("device_id", deviceId);

        if (updateError) {
          console.error("Error updating device:", updateError);
          alert("Error updating device. Please try again.");
          return;
        }

        console.log(`User logged out: ${user.user_metadata.username}`);
      }

      // Step 3: Sign out the user from Supabase Auth
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error("Error signing out:", signOutError);
        alert("Error signing out. Please try again.");
        return;
      }

      // Step 4: Call the `onLogout` method passed from the parent component
      await onLogout();

      // Step 5: Navigate to the login page
      navigate("/login");
    } catch (err) {
      console.error("Unexpected error during logout:", err);
      alert("An unexpected error occurred. Please try again.");
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
          <button className="link-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
