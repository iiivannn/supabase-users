import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import "./Login.css";
import Carousel from "../Carousel/Carousel";

import logo from "../../assets/parsafe_logo.png";
import img1 from "../../assets/parcel1.jpg";
import img2 from "../../assets/parcel2.jpg";
import img3 from "../../assets/parcel3.jpg";
import img4 from "../../assets/parcel4.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [availableDevices, setAvailableDevices] = useState([]);
  const [isAddingNewDevice, setIsAddingNewDevice] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const carouselImages = [img1, img2, img3, img4];

  // Fetch available device IDs on component mount
  useEffect(() => {
    fetchAvailableDevices();
  }, []);

  // Function to fetch available device IDs that don't have users associated
  const fetchAvailableDevices = async () => {
    setIsLoading(true);
    try {
      // Query for devices with null or empty user_id
      const { data, error } = await supabase
        .from("unit_devices")
        .select("device_id")
        .is("user_id", null);

      if (error) {
        console.error("Error fetching available devices:", error);
        setError("Error fetching available devices. Please try again.");
      } else {
        setAvailableDevices(data || []);
        // If there are available devices, set the first one as default
        if (data && data.length > 0) {
          setDeviceId(data[0].device_id);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching devices:", err);
      setError("An unexpected error occurred while fetching devices.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get the next device ID
  const getNextDeviceId = async () => {
    try {
      // Get all device IDs to find the highest unit number
      const { data, error } = await supabase
        .from("unit_devices")
        .select("device_id");

      if (error) {
        console.error("Error fetching devices for ID generation:", error);
        return "unit1"; // Default if error
      }

      if (!data || data.length === 0) {
        return "unit1"; // First device
      }

      // Find the highest unit number
      let highestNumber = 0;
      data.forEach((device) => {
        if (device.device_id.startsWith("unit")) {
          const unitNumber = parseInt(device.device_id.replace("unit", ""), 10);
          if (!isNaN(unitNumber) && unitNumber > highestNumber) {
            highestNumber = unitNumber;
          }
        }
      });

      return `unit${highestNumber + 1}`;
    } catch (err) {
      console.error("Error generating next device ID:", err);
      return "unit1"; // Default if error
    }
  };

  // Function to handle adding a new device
  const handleAddNewDevice = async () => {
    setIsLoading(true);
    try {
      // Generate the next device ID
      const nextDeviceId = await getNextDeviceId();

      // Insert new device with null user_id
      const { error: insertError } = await supabase
        .from("unit_devices")
        .insert([{ device_id: nextDeviceId, user_id: null, username: null }]);

      if (insertError) {
        console.error("Error adding new device:", insertError);
        setError("Error adding new device. Please try again.");
        return;
      }

      // Refresh the available devices list
      await fetchAvailableDevices();
      setDeviceId(nextDeviceId);
      setIsAddingNewDevice(false);
      setSuccessMessage(`New device ${nextDeviceId} added successfully!`);
    } catch (err) {
      console.error("Unexpected error adding device:", err);
      setError("An unexpected error occurred while adding the device.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    setSuccessMessage("");

    // Validate inputs
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (!deviceId) {
      setError("No available devices. Please add a new device.");
      return;
    }

    setIsLoading(true);
    try {
      // Sign in user
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      // Get user UUID and username from the authenticated user
      const userUuid = data.user.id;
      const username = data.user.user_metadata?.username || email;

      // Check if the selected device is still available
      const { data: deviceData, error: deviceError } = await supabase
        .from("unit_devices")
        .select("user_id")
        .eq("device_id", deviceId)
        .single();

      if (deviceError || deviceData.user_id) {
        setError("The selected device is no longer available.");
        setIsLoading(false);
        return;
      }

      // Update the device with the user's information
      const { error: updateError } = await supabase
        .from("unit_devices")
        .update({
          user_id: userUuid,
          username: username,
          isLogout: false,
          isOccupied: true,
        })
        .eq("device_id", deviceId);

      if (updateError) {
        console.error("Error associating device with user:", updateError);
        setError(
          "Error associating device with your account. Please try again."
        );
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Login successful! Redirecting...");
      console.log(`User logged in: ${username} with device: ${deviceId}`);

      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Login form section */}
      <div className="login-form-section">
        <div className="login-form-container">
          <img src={logo} className="logo-img" alt="ParSafe-Logo" />
          <h2 className="login-title">Account Login</h2>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <h2 className="device-title">Device Selection</h2>

          {!isAddingNewDevice ? (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="deviceIdSelect">
                  Available Devices
                </label>
                <div className="select-wrapper">
                  <select
                    id="deviceIdSelect"
                    className="form-input"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    disabled={isLoading}
                  >
                    {availableDevices.map((device) => (
                      <option key={device.device_id} value={device.device_id}>
                        {device.device_id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="device-footer">
                <div className="device-info">
                  These are unassigned devices available for registration.
                </div>

                <button
                  onClick={() => handleAddNewDevice()}
                  className="secondary-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add New Device"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="newDeviceId">
                  Adding New Device
                </label>
                <p className="device-info">
                  A new device ID will be automatically generated.
                </p>
              </div>

              <div className="device-actions">
                <button
                  onClick={handleAddNewDevice}
                  className="secondary-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Device"}
                </button>
                <button
                  onClick={() => setIsAddingNewDevice(false)}
                  className="cancel-button"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          <button
            onClick={handleLogin}
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Login"}
          </button>

          <div className="signup-link">
            <span className="signup-text">Don't have an account? </span>
            <span
              onClick={() => !isLoading && navigate("/signup")}
              className={`signup-action ${isLoading ? "disabled" : ""}`}
            >
              Sign up
            </span>
          </div>
        </div>
      </div>

      {/* Info section with image - no container, just floating text and image */}
      <div className="info-section">
        <div className="info-headings">
          <div className="info-texts">
            <p className="info-sub-text">A Smart Parcel Receiver</p>
            <h2 className="info-main-text">
              Receiving Your Orders One Parcel At A Time
            </h2>
          </div>
        </div>
        <div className="login-image-section">
          <Carousel images={carouselImages} interval={5000} />
        </div>
      </div>
    </div>
  );
}
