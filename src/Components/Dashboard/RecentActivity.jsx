import React from "react";
import "./Dashboard.css";

export default function RecentActivity({ recentActivities, formatDate }) {
  return (
    <div className="recent_activity">
      <h2>Recent Activity</h2>
      <div className="activity_contents">
        {recentActivities.map((activity, index) => (
          <div key={index} className="activity_card">
            <p>
              <strong>Parcel Name:</strong> {activity.parcel_name}
            </p>
            <p>
              <strong>Remarks:</strong> {activity.remarks}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(activity.date)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
