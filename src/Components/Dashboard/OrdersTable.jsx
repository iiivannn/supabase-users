import React, { useState } from "react";
import "./Dashboard.css";

export default function OrdersTable({
  topParcels,
  formatDate,
  handleRefresh,
  isRefresh,
}) {
  const [activeTab, setActiveTab] = useState("All");

  // Group parcels by their status
  const groupParcelsByStatus = () => {
    // For All tab: show all parcels
    // For Pending tab: show parcels where status is "pending"
    // For Completed tab: show parcels where status is "completed"
    // For Oversized tab: show parcels where status is "oversized"

    const pending = topParcels.filter((parcel) => parcel.status === "pending");

    const completed = topParcels.filter(
      (parcel) => parcel.status === "completed"
    );

    const oversized = topParcels.filter(
      (parcel) => parcel.status === "oversized"
    );

    const grouped = {
      All: topParcels,
      Pending: pending,
      Completed: completed,
      Oversized: oversized,
    };

    // Count the number of parcels in each category
    const counts = {
      All: topParcels.length,
      Pending: pending.length,
      Completed: completed.length,
      Oversized: oversized.length,
    };

    return { grouped, counts };
  };

  const { grouped, counts } = groupParcelsByStatus();
  const statusTabs = ["All", "Pending", "Completed", "Oversized"];

  // Display a message if there are no parcels to show
  if (topParcels.length === 0) {
    return (
      <div className="show_orders">
        <div className="title-refresh">
          <h2>Recent Parcels</h2>
          <button
            className="refresh_btn"
            onClick={handleRefresh}
            disabled={isRefresh}
          >
            {isRefresh ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className="no-parcels">No parcels found</div>
      </div>
    );
  }

  return (
    <div className="show_orders">
      <div className="title-refresh">
        <h2>Recent Parcels</h2>
        <button
          className="refresh_btn"
          onClick={handleRefresh}
          disabled={isRefresh}
        >
          {isRefresh ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Status tabs */}
      <div className="status-tabs">
        {statusTabs.map((status) => (
          <button
            key={status}
            className={`status-tab ${activeTab === status ? "active" : ""}`}
            onClick={() => setActiveTab(status)}
          >
            {status}{" "}
            {counts[status] > 0 && (
              <span className="count">({counts[status]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Parcel cards within the selected status group */}
      <div className="parcel-cards">
        {grouped[activeTab].length > 0 ? (
          grouped[activeTab].map((parcel, index) => {
            let statusClass = "pending";
            let statusLabel = "Pending";

            if (parcel.status === "completed") {
              statusClass = "completed";
              statusLabel = "Completed";
            } else if (parcel.status === "oversized") {
              statusClass = "oversized";
              statusLabel = "Oversized";
            }

            return (
              <div key={index} className={`parcel-card ${statusClass}`}>
                <div className="parcel-header">
                  <h3>{parcel.parcel_name}</h3>
                  <span className={`status-badge ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="parcel-details">
                  <div className="detail">
                    <span className="label">Barcode:</span>
                    <span className="value">{parcel.parcel_barcode}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Status:</span>
                    <span className="value">{parcel.status}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Added on:</span>
                    <span className="value">{formatDate(parcel.added_on)}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Received:</span>
                    <span className="value">
                      {parcel.completed_at
                        ? formatDate(parcel.completed_at)
                        : "Not yet"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-parcels">No parcels found in this category</div>
        )}
      </div>
    </div>
  );
}
