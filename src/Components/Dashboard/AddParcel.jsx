import "./Dashboard.css";
import help from "../../assets/question-mark.png";

export default function AddParcel({
  parcelName,
  setParcelName,
  parcelBarcode,
  setParcelBarcode,
  handleInsert,
  handleClear,
  success,
  error,
  setShowModal, // New prop to update modal state in parent
  showModal, // New prop to track modal state
}) {
  // Function to toggle modal
  const toggleModal = () => {
    setShowModal(!showModal);
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

      {/* Modal remains the same as in previous implementation */}
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
                <p className="colored-text-check">shipping information</p>.
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

      {/* Rest of the component remains the same */}
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
