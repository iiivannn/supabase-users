import React from "react";
import "./Dashboard.css";

export default function OrdersTable({ topParcels, formatDate, handleRefresh }) {
  const sortedParcels = topParcels.sort((a, b) => {
    const dateA = a.added_on ? new Date(a.added_on) : new Date(0);
    const dateB = b.added_on ? new Date(b.added_on) : new Date(0);
    return dateB - dateA;
  });

  return (
    <div className="show_orders">
      <div className="title-refresh">
        <h2>Top 5 Recent Parcels</h2>
        <button onClick={handleRefresh}>Refresh</button>
      </div>
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
          {sortedParcels.map((parcel, index) => (
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
