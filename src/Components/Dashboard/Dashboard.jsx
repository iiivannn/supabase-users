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
  const [parcelName, setParcelName] = useState(""); // Define parcelName state
  const [parcelBarcode, setParcelBarcode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [today, setToday] = useState(0);
  const [weekly, setWeekly] = useState(0);
  const [topParcels, setTopParcels] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const getSummary = async () => {
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

    const { count: todayCount, error: todayError } = await supabase
      .from("user_order")
      .select("*", { count: "exact" })
      .eq("status", "completed")
      .gte("completed_at", startOfDay.toISOString());

    const { count: weeklyCount, error: weeklyError } = await supabase
      .from("user_order")
      .select("*", { count: "exact" })
      .eq("status", "completed")
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

  const getTopParcels = async () => {
    const { data, error } = await supabase
      .from("user_order")
      .select("parcel_name, parcel_barcode, status, added_on, completed_at")
      .order("added_on")
      .limit(5);

    if (error) {
      console.error("Error fetching top parcels:", error);
    } else {
      const sortedData = data.sort((a, b) => {
        const dateA = a.added_on ? new Date(a.added_on) : new Date(0);
        const dateB = b.added_on ? new Date(b.added_on) : new Date(0);
        return dateB - dateA;
      });
      setTopParcels(sortedData);
    }
  };

  const getRecentActivities = async () => {
    const { data, error } = await supabase
      .from("user_order")
      .select("parcel_name, status, added_on, completed_at")
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

  useEffect(() => {
    getSummary();
    getTopParcels();
    getRecentActivities();
  }, []);

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
      getSummary(); // Update summary after insertion
      getTopParcels(); // Update top parcels after insertion
      getRecentActivities(); // Update recent activities after insertion
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
        <Navigation onLogout={onLogout} />
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
