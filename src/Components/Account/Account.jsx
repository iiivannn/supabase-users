/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import Navigation from "../Dashboard/Navigation";
import menu from "../../assets/more.png";
import "./Account.css";

export default function Account({ onLogout }) {
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState(""); // To track the original username
  const [email, setEmail] = useState("");

  // Password states for the password update section
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMenuActive, setIsMenuActive] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuActive((prevState) => !prevState);
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUsername(user.user_metadata.username);
          setOriginalUsername(user.user_metadata.username);
          setEmail(user.email);
        }
      } catch (error) {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Function to update username across all relevant tables
  const updateUsernameInTables = async (oldUsername, newUsername) => {
    try {
      // Begin a transaction across multiple tables
      const tables = ["unit_devices", "user_order", "users"];
      const updates = tables.map((table) =>
        supabase
          .from(table)
          .update({ username: newUsername })
          .eq("username", oldUsername)
      );

      // Execute all updates
      const results = await Promise.all(updates);

      // Check for errors in any of the updates
      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        console.error("Errors updating username in tables:", errors);
        throw new Error("Failed to update username in one or more tables");
      }

      return { success: true };
    } catch (error) {
      console.error("Error in transaction:", error);
      return { success: false, error };
    }
  };

  const handleUpdateUsername = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("User not logged in");
        return;
      }

      // First update in Auth service
      const { error } = await supabase.auth.updateUser({
        data: { username },
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Then update in custom tables
      const updateResult = await updateUsernameInTables(
        originalUsername,
        username
      );

      if (!updateResult.success) {
        // If database update fails, try to revert Auth update
        await supabase.auth.updateUser({
          data: { username: originalUsername },
        });
        setError("Failed to update username in all systems");
        return;
      }

      setSuccess("Username updated successfully");
      setOriginalUsername(username); // Update the original username reference
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (newPassword !== confirmNewPassword) {
        setError("New passwords do not match");
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordCurrentPassword,
      });

      if (signInError) {
        setError("Incorrect current password");
        setLoading(false);
        return;
      }

      // Update password in Auth service
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password updated successfully");
        setPasswordCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page_layout">
      {/* NAVIGATION BAR */}
      <div className={`nav${isMenuActive ? "-active" : ""}`}>
        <Navigation onLogout={onLogout} />
      </div>
      <button
        className="menu_btn"
        onClick={handleMenuToggle}
        aria-label="Toggle Navigation Menu"
      >
        <img className="menu_img" src={menu} alt="Menu" />
      </button>

      {/* MAIN CONTENT */}
      <div className="main_content">
        <div className="account_container">
          <div className="account-header">
            <h2>Account Settings</h2>
            {email && <p className="account-email">Email: {email}</p>}
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          {loading && <p className="loading-message">Loading...</p>}

          <div className="account_section">
            <h3>Update Username</h3>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleUpdateUsername}
              disabled={
                loading || username === originalUsername || !username.trim()
              }
            >
              Update Username
            </button>
          </div>

          <div className="account_section">
            <h3>Update Password</h3>
            <input
              type="password"
              placeholder="Current Password"
              value={passwordCurrentPassword}
              onChange={(e) => setPasswordCurrentPassword(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleUpdatePassword}
              disabled={
                loading ||
                !passwordCurrentPassword.trim() ||
                !newPassword.trim() ||
                !confirmNewPassword.trim()
              }
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
