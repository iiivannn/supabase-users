import React from "react";
import "./Dashboard.css";

export default function AddParcel({
  parcelName,
  setParcelName,
  parcelBarcode,
  setParcelBarcode,
  handleInsert,
  handleClear,
  success,
  error,
}) {
  return (
    <div className="input_feature">
      <h2>Add Parcel Details</h2>
      <div className="input_wrapper">
        <div className="input_name">
          <label htmlFor="parcel_name">Parcel Name: </label>
          <input
            name="parcel_name"
            type="text"
            placeholder="Enter Parcel Name"
            value={parcelName}
            onChange={(e) => setParcelName(e.target.value)}
          />
        </div>

        <div className="input_barcode">
          <label htmlFor="parcel_barcode">Parcel Barcode</label>
          <input
            name="parcel_barcode"
            type="text"
            placeholder="Enter parcel code"
            value={parcelBarcode}
            onChange={(e) => setParcelBarcode(e.target.value)}
          />
        </div>
      </div>

      <div className="input_buttons">
        <button onClick={handleInsert}>Submit</button>
        <button onClick={handleClear}>Clear</button>
      </div>
      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
