import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";

export default function Dashboard({ userName, onLogout }) {
  const navigate = useNavigate();
  const [parcelBarcode, setParcelBarcode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogout = async () => {
    await onLogout(); // Call the logout method passed from App
    navigate("/login"); // Explicitly navigate to login page
  };

  const handleInsert = async () => {
    setError("");
    setSuccess("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log("Logged-in user:", user);
    if (userError || !user) {
      setError("User not logged in");
      return;
    }

    const { error: insertError } = await supabase.from("user_order").insert([
      {
        username: user.user_metadata.username,
        parcel_barcode: parcelBarcode,
        status: "pending",
        completed_at: null,
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      setError(insertError.message);
    } else {
      console.log("Insert successful");
      setSuccess("Parcel barcode inserted successfully");
      setParcelBarcode("");
    }
  };

  return (
    <div>
      <h2>Parcel Tracking</h2>
      <p>Welcome, {userName}!</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <input
        type="text"
        placeholder="Enter parcel code"
        value={parcelBarcode}
        onChange={(e) => setParcelBarcode(e.target.value)}
      />
      <button onClick={handleInsert}>Insert Parcel Barcode</button>
      <br />
      <br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
