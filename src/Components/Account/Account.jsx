import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import Navigation from "../Dashboard/Navigation";
import "./Account.css";

export default function Account({ onLogout }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUsername(user.user_metadata.username);
        setEmail(user.email);
      }
    };

    fetchUser();
  }, []);

  const handleUpdateUsername = async () => {
    setError("");
    setSuccess("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setError("User not logged in");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: { username },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Username updated successfully");
    }
  };

  const handleUpdateEmail = async () => {
    setError("");
    setSuccess("");

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
      password: currentPassword,
    });

    if (signInError) {
      setError("Incorrect password");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      email,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Email updated successfully");
    }
  };

  const handleUpdatePassword = async () => {
    setError("");
    setSuccess("");

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }

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
      password: currentPassword,
    });

    if (signInError) {
      setError("Incorrect current password");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password updated successfully");
    }
  };

  return (
    <div>
      <Navigation onLogout={onLogout} />
      <div className="account_container">
        <h2>Account Settings</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <div className="account_section">
          <h3>Update Username</h3>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleUpdateUsername}>Update Username</button>
        </div>

        <div className="account_section">
          <h3>Update Email</h3>
          <input
            type="email"
            placeholder="New Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <button onClick={handleUpdateEmail}>Update Email</button>
        </div>

        <div className="account_section">
          <h3>Update Password</h3>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          <button onClick={handleUpdatePassword}>Update Password</button>
        </div>
      </div>
    </div>
  );
}
