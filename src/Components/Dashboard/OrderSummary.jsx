import stats_img from "../../assets/stats_img.png";
import arrow from "../../assets/right_arrow.png";
import { useNavigate } from "react-router-dom";

export default function OrderSummary({ userName, today, weekly }) {
  const navigate = useNavigate();
  return (
    <div className="summary_dashboard">
      <p>Welcome, {userName}!</p>
      <img src={stats_img} alt="Parcel Box Image" className="stats_img" />
      <div className="summary_stats">
        <div className="summary_today">
          <h4>Received Today</h4>
          <p>{today} Orders</p>
        </div>
        <div className="summary_weekly">
          <h4>Weekly Stats</h4>
          <p>{weekly} Orders Received</p>
        </div>
      </div>
      <div className="my_orders">
        <button onClick={() => navigate("/orders")}>
          <div className="button_arrow">
            View My Orders{" "}
            <img className="right_arrow" src={arrow} alt="Right Arrow" />
          </div>
        </button>
      </div>
    </div>
  );
}
