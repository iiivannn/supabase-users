/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import Navigation from "../Dashboard/Navigation";
import "./Account.css";

export default function Account({ onLogout }) {
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState(""); // To track the original username
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState(""); // To track the original email

  // Separate password states for each section
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
          setOriginalEmail(user.email);
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

  // Function to update email in users table
  const updateEmailInTable = async (username, newEmail) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ email: newEmail })
        .eq("username", username);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error updating email:", error);
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

  const handleUpdateEmail = async () => {
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

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: emailCurrentPassword,
      });

      if (signInError) {
        setError("Incorrect password");
        return;
      }

      // First update in Auth service
      const { error } = await supabase.auth.updateUser({
        email,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Then update in users table
      const updateResult = await updateEmailInTable(username, email);

      if (!updateResult.success) {
        // If database update fails, try to revert Auth update
        await supabase.auth.updateUser({
          email: originalEmail,
        });
        setError("Failed to update email in all systems");
        return;
      }

      setSuccess("Email updated successfully");
      setOriginalEmail(email); // Update the original email reference
      setEmailCurrentPassword(""); // Clear password field
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
      // Supabase handles the hashing automatically, we don't need to do it manually
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError(error.message);
      } else {
        // No need to update password in users table - Supabase manages this
        // The password in the users table should be a reference to the auth.users table
        // or should not be used for authentication
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
    <div className="page-container">
      <div className="nav-sidebar">
        <Navigation onLogout={onLogout} />
      </div>

      <div className="content-area">
        <div className="account_container">
          <div className="account-header">
            <h2>Account Settings</h2>
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
            <h3>Update Email</h3>
            <input
              type="email"
              placeholder="New Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Current Password"
              value={emailCurrentPassword}
              onChange={(e) => setEmailCurrentPassword(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleUpdateEmail}
              disabled={
                loading ||
                email === originalEmail ||
                !email.trim() ||
                !emailCurrentPassword.trim()
              }
            >
              Update Email
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
