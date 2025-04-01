import "./Dashboard.css";
import help from "../../assets/question-mark.png";
import { useEffect, useState } from "react";
import shipping from "../../assets/shipping.jpg";

export default function AddParcel({
  parcelName,
  setParcelName,
  parcelBarcode,
  setParcelBarcode,
  handleInsert,
  handleClear,
  success,
  error,
  setShowModal,
  showModal,
}) {
  // State for notification modal
  const [showNotification, setShowNotification] = useState(false);

  // Function to toggle help modal
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  // Show notification modal when success or error changes
  useEffect(() => {
    if (success || error) {
      setShowNotification(true);

      // Auto-hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Function to close notification modal
  const closeNotification = () => {
    setShowNotification(false);
  };

  return (
    <div className="input_feature">
      <div className="title-wrapper">
        <h2 className="add_title">Add Parcel Details</h2>
        <img
          className="question-mark"
          src={help}
          alt="Barcode Instructions"
          onClick={toggleModal}
          style={{ cursor: "pointer" }}
        />
      </div>

      {/* Help Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={toggleModal}>
              ×
            </button>
            <h3>Have a Parcel?</h3>
            <p>Here are some guidelines for entering parcel details:</p>
            <ul>
              <li>
                Enter the{" "}
                <p className="colored-text-check">shipping information</p> for
                the Parcel Barcode.
                <img
                  src={shipping}
                  className="shipping-info"
                  alt="Shippin Information"
                />
                <p className="note">
                  <b>Note:</b> Shipping information may not appear immediately.
                  Please wait 1-2 days.
                </p>
              </li>

              <li>
                Do not enter the{" "}
                <p className="colored-text-uncheck">Order ID</p>.
              </li>
              <li>You may enter any name for your parcel.</li>
            </ul>
            <div className="modal-buttons">
              <button className="modal-close-btn" onClick={toggleModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal for Success/Error Messages */}
      {showNotification && (success || error) && (
        <div className="notification-overlay">
          <div
            className={`notification-modal ${
              success ? "success-modal" : "error-modal"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="notification-close" onClick={closeNotification}>
              ×
            </button>

            <div className="notification-message">{success || error}</div>
          </div>
        </div>
      )}

      {/* Input Fields */}
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
