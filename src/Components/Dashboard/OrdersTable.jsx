import React from "react";
import "./Dashboard.css";

export default function OrdersTable({ topParcels, formatDate, handleRefresh }) {
  return (
    <div className="show_orders">
      <div className="title-refresh">
        <h2>Recent Parcels</h2>
        <button className="refresh_btn" onClick={handleRefresh}>
          Refresh
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Parcel Name</th>
            <th>Parcel Barcode</th>
            <th>Status</th>
            <th>Date Added</th>
            <th>Date Received</th>
          </tr>
        </thead>
        <tbody>
          {topParcels.map((parcel, index) => (
            <tr key={index}>
              <td>{parcel.parcel_name}</td>
              <td>{parcel.parcel_barcode}</td>
              <td>{parcel.status}</td>
              <td>{formatDate(parcel.added_on)}</td>
              <td>
                {parcel.completed_at ? formatDate(parcel.completed_at) : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
