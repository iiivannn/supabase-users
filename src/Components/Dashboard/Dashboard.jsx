/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import Navigation from "./Navigation";
import RecentActivity from "./RecentActivity";
import OrdersTable from "./OrdersTable";
import AddParcel from "./AddParcel";
import ParsafeCard from "./ParsafeCard";
import OrderSummary from "./OrderSummary";

import menu from "../../assets/more.png";

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
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleMenuToggle = () => {
    setIsMenuActive((prevState) => !prevState);
  };

  useEffect(() => {
    async function verifySession() {
      setIsLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          console.log(
            "No active session found, attempting to restore from cookies"
          );

          const getTokenFromCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(";").shift();
            return null;
          };

          const accessToken = getTokenFromCookie("sb-access-token");
          const refreshToken = getTokenFromCookie("sb-refresh-token");

          if (accessToken && refreshToken) {
            console.log("Found tokens in cookies, trying to restore session");
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error("Failed to restore session from tokens:", error);
              onLogout();
              return;
            }

            console.log("Session restored successfully");
          } else {
            console.log("No tokens found in cookies");
            onLogout();
            return;
          }
        }

        const { error: testError } = await supabase
          .from("unit_devices")
          .select("device_id")
          .limit(1);

        if (testError) {
          console.error(
            "Session appears invalid, test query failed:",
            testError
          );
          onLogout();
          return;
        }

        console.log("Session verified successfully");
        setIsLoading(false);

        getDeviceId();
        getSummary();
        getTopParcels();
        getRecentActivities();
      } catch (err) {
        console.error("Session verification error:", err);
        onLogout();
      }
    }

    verifySession();
  }, [onLogout]);

  const getDeviceId = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      if (!user) {
        console.error("User not found");
        onLogout();
        return;
      }

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
    } catch (err) {
      console.error("Error in getDeviceId:", err);
    }
  };

  const getSummary = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      if (!user) {
        console.error("User not found");
        onLogout();
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

      const { count: todayCount, error: todayError } = await supabase
        .from("user_order")
        .select("*", { count: "exact" })
        .in("status", ["completed", "oversized"])
        .eq("username", user.user_metadata?.username || user.email)
        .gte("completed_at", startOfDay.toISOString());

      const { count: weeklyCount, error: weeklyError } = await supabase
        .from("user_order")
        .select("*", { count: "exact" })
        .in("status", ["completed", "oversized"])
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
    } catch (err) {
      console.error("Error in getSummary:", err);
    }
  };

  const getTopParcels = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      if (!user) {
        console.error("User not found");
        onLogout();
        return;
      }

      const { data, error } = await supabase
        .from("user_order")
        .select("parcel_name, parcel_barcode, status, added_on, completed_at")
        .eq("username", user.user_metadata?.username || user.email)
        .order("added_on", { ascending: false });

      if (error) {
        console.error("Error fetching parcels:", error);
      } else {
        setTopParcels(data);
      }
    } catch (err) {
      console.error("Error in getTopParcels:", err);
    }
  };

  const getRecentActivities = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      if (!user) {
        console.error("User not found");
        onLogout();
        return;
      }

      const { data, error } = await supabase
        .from("user_order")
        .select("parcel_name, status, added_on, completed_at")
        .eq("username", user.user_metadata?.username || user.email)
        .order("added_on", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Error fetching recent activities:", error);
      } else {
        const activities = data.map((item) => ({
          parcel_name: item.parcel_name,
          remarks:
            item.status === "completed"
              ? "Received Parcel"
              : item.status === "oversized"
              ? "Oversized Parcel"
              : "Added Parcel",
          date:
            item.status === "completed" || item.status === "oversized"
              ? item.completed_at
              : item.added_on,
        }));
        const sortedActivities = activities.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setRecentActivities(sortedActivities);
      }
    } catch (err) {
      console.error("Error in getRecentActivities:", err);
    }
  };

  const handleInsert = async () => {
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError("Error fetching user information");
        return;
      }

      if (!user) {
        setError("User not logged in");
        return;
      }

      if (
        !parcelBarcode ||
        parcelBarcode.trim() === "" ||
        !parcelName ||
        parcelName.trim() === ""
      ) {
        setError("Incomplete Parcel Details.");
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
        getSummary();
        getTopParcels();
        getRecentActivities();
      }
    } catch (err) {
      console.error("Error in handleInsert:", err);
      setError("An unexpected error occurred");
    }
  };

  const handleClear = () => {
    setError("");
    setSuccess("");
    setParcelName("");
    setParcelBarcode("");
  };

  const handleRefresh = async () => {
    setRefresh(true);
    try {
      await Promise.all([getSummary(), getTopParcels(), getRecentActivities()]); // Fetch all data
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefresh(false);
    }
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

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="page_layout">
        <div className={`nav${isMenuActive ? "-active" : ""}`}>
          <Navigation onLogout={onLogout} deviceId={deviceId} />
        </div>
        <button
          className="menu_btn"
          onClick={handleMenuToggle}
          aria-label="Toggle Navigation Menu"
          disabled={showModal}
          style={{ pointerEvents: showModal ? "none" : "auto" }}
        >
          <img className="menu_img" src={menu} alt="Menu" />
        </button>

        <div className="top_components">
          {/* PARSAFE CARD */}
          <ParsafeCard />

          {/* ORDERS SUMMARY */}
          <OrderSummary userName={userName} today={today} weekly={weekly} />
        </div>

        <div className="bottom_components">
          <div className="middle_components">
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
              showModal={showModal}
              setShowModal={setShowModal}
            />

            {/* ORDERS TABLE */}
            <OrdersTable
              topParcels={topParcels}
              formatDate={formatDate}
              handleRefresh={handleRefresh}
              isRefresh={refresh}
            />
          </div>

          {/* RECENT ACTIVITY */}
          <RecentActivity
            recentActivities={recentActivities}
            formatDate={formatDate}
          />
        </div>
      </div>
    </div>
  );
}
