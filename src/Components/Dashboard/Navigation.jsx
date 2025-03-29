import { useNavigate } from "react-router-dom";
import logo from "../../assets/parsafe_logo.png";
import { supabase } from "../../supabase";
import "./Dashboard.css";

export default function Navigation({ onLogout, deviceId }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Debug logs to trace values
      console.log("Logout initiated with deviceId:", deviceId);

      // Step 1: Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user during logout:", userError);
        // Continue with logout even if we can't get the user
      }

      // Step 2: Update the device record if we have both user and deviceId
      if (user && deviceId) {
        console.log(
          "Attempting to update device:",
          deviceId,
          "for user:",
          user.id
        );

        const { error: updateError, data: updateResult } = await supabase
          .from("unit_devices")
          .update({
            user_id: null,
            username: null,
            isLogout: true,
            isOccupied: false,
          })
          .eq("device_id", deviceId);

        if (updateError) {
          console.error("Error updating device:", updateError);
          // Don't return - continue with logout even if update fails
        } else {
          console.log("Device update result:", updateResult);
        }
      } else {
        console.warn("Missing user or deviceId for device update:", {
          hasUser: !!user,
          deviceId,
        });
      }

      // Step 3: Sign out from Supabase Auth
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error("Error signing out:", signOutError);
        alert("Error signing out. Please try again.");
        return;
      }

      // Step 4: Call the parent's onLogout function if it exists
      if (typeof onLogout === "function") {
        await onLogout();
      } else {
        console.warn("onLogout function is not defined");
      }

      // Step 5: Navigate to login page
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
