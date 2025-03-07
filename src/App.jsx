import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "../supabase";
import Login from "./Components/Login/Login";
import Signup from "./Components/Signup/Signup";
import Dashboard from "./Components/Dashboard/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [isNewSignup, setIsNewSignup] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        setUserName(user.user_metadata?.username || "Unknown User");
      }
    };

    fetchUser();

    // Listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && !isNewSignup) {
          if (session?.user) {
            setUser(session.user);
            setUserName(session.user.user_metadata?.username || "Unknown User");
          }
        } else if (event === "SIGNED_IN" && isNewSignup) {
          // Reset the new signup flag after signup
          setIsNewSignup(false);
        } else if (event === "SIGNED_OUT") {
          // Clear user state when signed out
          setUser(null);
          setUserName("");
        }
      }
    );

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [isNewSignup]);

  // Method to set signup flag before signup
  const handleNewSignup = () => {
    setIsNewSignup(true);
  };

  // Logout handler to be passed down to Dashboard or other components
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Router>
      <div>
        <h1>Parcel Tracking App</h1>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Dashboard userName={userName} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/signup"
            element={
              user ? (
                <Navigate to="/" />
              ) : (
                <Signup onNewSignup={handleNewSignup} />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
