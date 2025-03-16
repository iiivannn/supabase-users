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
      <h2 className="add_title">Add Parcel Details</h2>
      <div className="input_wrapper">
        <div className="input_name">
          <label htmlFor="parcel_name">Parcel Name: </label>
          <input
            name="parcel_name"
            type="text"
            placeholder="Enter Parcel Name"
            value={parcelName}
            className="input_field"
            onChange={(e) => setParcelName(e.target.value)}
          />
        </div>

        <div className="input_barcode">
          <label htmlFor="parcel_barcode">Parcel Barcode:</label>
          <input
            name="parcel_barcode"
            type="text"
            placeholder="Enter parcel code"
            value={parcelBarcode}
            className="input_field"
            onChange={(e) => setParcelBarcode(e.target.value)}
          />
        </div>
      </div>

      <div className="lower_box">
        {success && (
          <p className="box_msg" style={{ color: "green" }}>
            {success}
          </p>
        )}
        {error && (
          <p className="box_msg" style={{ color: "red" }}>
            {error}
          </p>
        )}
        <div className="btn_box">
          <div className="input_buttons">
            <button className="submit_btn" onClick={handleInsert}>
              Submit
            </button>
            <button className="clear_btn" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
