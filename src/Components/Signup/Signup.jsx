import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import bcrypt from "bcryptjs";
import logo from "../../assets/parsafe_logo.png";
import img1 from "../../assets/parcel1.jpg";
import img2 from "../../assets/parcel2.jpg";
import img3 from "../../assets/parcel3.jpg";
import img4 from "../../assets/parcel4.jpg";
import Carousel from "../Carousel/Carousel";

import "../Login/Login.css"; // Reusing the same CSS file

export default function Signup({ onNewSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const carouselImages = [img4, img1, img2, img3];

  const handleSignup = async () => {
    // Reset previous errors
    setError("");
    setSuccessMessage("");

    // Validate inputs
    if (!username) {
      setError("Username is required");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user details into the 'users' table
      const { error: insertError } = await supabase.from("users").insert([
        {
          username,
          email,
          password: hashedPassword,
        },
      ]);

      if (insertError) {
        setError(insertError.message);
        setIsLoading(false);
        return;
      }

      // Call the onNewSignup method before signing up (if provided)
      if (onNewSignup) {
        onNewSignup();
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
      } else {
        // Force sign out after signup
        await supabase.auth.signOut();

        setSuccessMessage("Signup successful! Redirecting to login...");

        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Info section with image - same as login page */}
      <div className="info-section">
        <div className="info-headings">
          <div className="signup-texts">
            <p className="info-sub-text ">A Smart Parcel Receiver</p>
            <h2 className="info-main-text ">
              Receiving Your Orders One Parcel At A Time
            </h2>
          </div>
        </div>
        <div className="login-image-section">
          <Carousel images={carouselImages} interval={5000} />
        </div>
      </div>

      {/* Signup form section */}
      <div className="login-form-section">
        <div className="login-form-container">
          <img src={logo} className="logo-img" alt="ParSafe-Logo" />
          <h2 className="login-title">Create Account</h2>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleSignup}
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Sign Up"}
          </button>

          <div className="signup-link">
            <span className="signup-text">Already have an account? </span>
            <span
              onClick={() => !isLoading && navigate("/login")}
              className={`signup-action ${isLoading ? "disabled" : ""}`}
            >
              Log in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
