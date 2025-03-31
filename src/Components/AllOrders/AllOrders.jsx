import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";
import Navigation from "../Dashboard/Navigation";
import menu from "../../assets/more.png";
import "./AllOrders.css";

export default function AllOrders({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState("completed_at");
  const [sortDirection, setSortDirection] = useState(true); // false = descending
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const handleMenuToggle = () => {
    setIsMenuActive((prevState) => !prevState);
  };

  const fetchOrders = useCallback(
    async (field = sortField, ascending = sortDirection) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("User not logged in");
        return;
      }

      const { data, error } = await supabase
        .from("user_order")
        .select("parcel_name, parcel_barcode, status, added_on, completed_at")
        .eq("username", user.user_metadata.username)
        .order(field, { ascending });

      if (error) {
        setError(error.message);
      } else {
        setOrders(data);
      }
    },
    [sortField, sortDirection]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const completed = orders.filter(
      (order) => order.status === "completed"
    ).length;
    const pending = orders.filter((order) => order.status === "pending").length;
    setCompletedCount(completed);
    setPendingCount(pending);
  }, [orders]);

  const handleSort = (field) => {
    // If clicking the same field, toggle direction
    const newDirection = field === sortField ? !sortDirection : false;
    setSortField(field);
    setSortDirection(newDirection);
    fetchOrders(field, newDirection);
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
        <div className="orders_container">
          <div className="orders-header">
            <h2>All Orders</h2>

            <div className="sort-buttons">
              <button
                className={`sort-btn ${
                  sortField === "added_on" ? "active" : ""
                }`}
                onClick={() => handleSort("added_on")}
              >
                Sort by Date Added{" "}
                {sortField === "added_on" && (sortDirection ? "↑" : "↓")}
              </button>
              <button
                className={`sort-btn ${
                  sortField === "completed_at" ? "active" : ""
                }`}
                onClick={() => handleSort("completed_at")}
              >
                Sort by Date Completed{" "}
                {sortField === "completed_at" && (sortDirection ? "↑" : "↓")}
              </button>
            </div>
          </div>
          <div className="order-stats">
            <p>Received Parcels: {completedCount}</p>
            <p>Pending Parcels: {pendingCount}</p>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Parcel Name</th>
                  <th>Parcel Barcode</th>
                  <th>Status</th>
                  <th>Date Added</th>
                  <th>Date Completed</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.parcel_name}</td>
                    <td>{order.parcel_barcode}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatDate(order.added_on)}</td>
                    <td>
                      {order.completed_at
                        ? formatDate(order.completed_at)
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
