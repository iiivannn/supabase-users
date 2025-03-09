import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import Navigation from "../Dashboard/Navigation";
import "./AllOrders.css";

export default function AllOrders({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
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
        .eq("username", user.user_metadata.username);

      if (error) {
        setError(error.message);
      } else {
        setOrders(data);
      }
    };

    fetchOrders();
  }, []);

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
      <Navigation onLogout={onLogout} />
      <div className="orders_container">
        <h2>All Orders</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
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
                <td>{order.status}</td>
                <td>{formatDate(order.added_on)}</td>
                <td>
                  {order.completed_at ? formatDate(order.completed_at) : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
