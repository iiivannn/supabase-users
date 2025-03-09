import React from "react";
import card_img from "../../assets/card_img.png";
import "./Dashboard.css";

export default function ParsafeCard() {
  return (
    <div className="card">
      <div className="card_img_container">
        <img className="card_img" src={card_img} alt="Card Image" />
      </div>
      <div className="card_text">
        <h2>Receive your products with ParSafe</h2>
        <p>Your own parcel locker</p>
      </div>
    </div>
  );
}
