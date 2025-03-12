import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import Navigation from "./Navigation";
import RecentActivity from "./RecentActivity";
import OrdersTable from "./OrdersTable";
import AddParcel from "./AddParcel";
import ParsafeCard from "./ParsafeCard";
import OrderSummary from "./OrderSummary";

import "./Dashboard.css";

export default function Dashboard({ userName, onLogout }) {
  const [parcelName, setParcelName] = useState("");
  const [parcelBarcode, setParcelBarcode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [today, setToday] = useState(0);
  const [weekly, setWeekly] = useState(0);
  const [topParcels, setTopParcels] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [deviceId, setDeviceId] = useState("");

  // Fetch the device ID of the logged-in user
  const getDeviceId = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return;
    }

    // Fetch the device ID associated with the logged-in user
    const { data: deviceData, error: deviceError } = await supabase
      .from("unit_devices")
      .select("device_id")
      .eq("user_id", user.id)
      .single();

    if (deviceError) {
      console.error("Error fetching device ID:", deviceError);
    } else if (deviceData) {
      setDeviceId(deviceData.device_id);
    }
  };

  // Fetch today's and weekly parcel counts for the logged-in user
  const getSummary = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return;
    }

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    );

    // Fetch today's count for the logged-in user
    const { count: todayCount, error: todayError } = await supabase
      .from("user_order")
      .select("*", { count: "exact" })
      .eq("status", "completed")
      .eq("username", user.user_metadata?.username || user.email)
      .gte("completed_at", startOfDay.toISOString());

    // Fetch weekly count for the logged-in user
    const { count: weeklyCount, error: weeklyError } = await supabase
      .from("user_order")
      .select("*", { count: "exact" })
      .eq("status", "completed")
      .eq("username", user.user_metadata?.username || user.email)
      .gte("completed_at", startOfWeek.toISOString());

    if (todayError) {
      console.error("Error fetching today's summary:", todayError);
    } else {
      setToday(todayCount);
    }

    if (weeklyError) {
      console.error("Error fetching weekly summary:", weeklyError);
    } else {
      setWeekly(weeklyCount);
    }
  };

  // Fetch top parcels for the logged-in user
  const getTopParcels = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return;
    }

    const { data, error } = await supabase
      .from("user_order")
      .select("parcel_name, parcel_barcode, status, added_on, completed_at")
      .eq("username", user.user_metadata?.username || user.email)
      .order("added_on", { ascending: false }) // Sort by added_on date
      .limit(5);

    if (error) {
      console.error("Error fetching top parcels:", error);
    } else {
      setTopParcels(data);
    }
  };

  // Fetch recent activities for the logged-in user
  const getRecentActivities = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return;
    }

    const { data, error } = await supabase
      .from("user_order")
      .select("parcel_name, status, added_on, completed_at")
      .eq("username", user.user_metadata?.username || user.email)
      .order("added_on", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching recent activities:", error);
    } else {
      const activities = data.map((item) => ({
        parcel_name: item.parcel_name,
        remarks:
          item.status === "completed" ? "Received Parcel" : "Added Parcel",
        date: item.status === "completed" ? item.completed_at : item.added_on,
      }));
      const sortedActivities = activities.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setRecentActivities(sortedActivities);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    getDeviceId();
    getSummary();
    getTopParcels();
    getRecentActivities();
  }, []);

  // Handle inserting a new parcel
  const handleInsert = async () => {
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

    const { error: insertError } = await supabase.from("user_order").insert([
      {
        username: user.user_metadata?.username || user.email,
        parcel_name: parcelName,
        parcel_barcode: parcelBarcode,
        status: "pending",
        added_on: new Date().toISOString(),
        completed_at: null,
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      setError(insertError.message);
    } else {
      console.log("Insert successful");
      setSuccess("Parcel details inserted successfully");
      setParcelName("");
      setParcelBarcode("");
      getSummary(); // Update summary
      getTopParcels(); // Update top parcels
      getRecentActivities(); // Update recent activities
    }
  };

  const handleClear = () => {
    setError("");
    setSuccess("");
    setParcelName("");
    setParcelBarcode("");
  };

  const handleRefresh = () => {
    getTopParcels();
    getRecentActivities();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      timeZone: "Asia/Manila",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    };
    const date = new Date(dateString).toLocaleString("en-US", options);
    return date;
  };

  return (
    <div>
      {/* NAVIGATION BAR */}
      <div className="navbar">
        <Navigation onLogout={onLogout} deviceId={deviceId} />
      </div>

      {/* ORDERS SUMMARY */}
      <OrderSummary userName={userName} today={today} weekly={weekly} />

      {/* PARSAFE CARD */}
      <ParsafeCard />

      {/* ADD BARCODE */}
      <AddParcel
        parcelName={parcelName}
        setParcelName={setParcelName}
        parcelBarcode={parcelBarcode}
        setParcelBarcode={setParcelBarcode}
        handleInsert={handleInsert}
        handleClear={handleClear}
        success={success}
        error={error}
      />

      {/* ORDERS TABLE */}
      <OrdersTable
        topParcels={topParcels}
        formatDate={formatDate}
        handleRefresh={handleRefresh}
      />

      {/* RECENT ACTIVITY */}
      <RecentActivity
        recentActivities={recentActivities}
        formatDate={formatDate}
      />
    </div>
  );
}
