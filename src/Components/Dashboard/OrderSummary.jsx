import stats_img from "../../assets/stats_img.png";
import arrow from "../../assets/right_arrow.png";
import { useNavigate } from "react-router-dom";

export default function OrderSummary({ userName, today, weekly }) {
  const navigate = useNavigate();
  return (
    <div className="summary_dashboard">
      <p className="welcome_title">Welcome, {userName}!</p>
      <img src={stats_img} alt="Parcel Box Image" className="stats_img" />
      <div className="summary_stats">
        <div className="summary_today">
          <h4>Today</h4>
          <p>{today} Orders</p>
        </div>
        <div className="summary_weekly">
          <h4>Weekly Stats</h4>
          <p>{weekly} Orders Received</p>
        </div>
      </div>
      <div className="my_orders">
        <button className="button_arrow" onClick={() => navigate("/orders")}>
          <div className="button_arrow_div">
            <p className="view_orders">View My Orders</p>
            <img className="right_arrow" src={arrow} alt="Right Arrow" />
          </div>
        </button>
      </div>
    </div>
  );
}
