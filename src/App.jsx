import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./supabase";
import Login from "./Components/Login/Login";
import Signup from "./Components/Signup/Signup";
import Dashboard from "./Components/Dashboard/Dashboard";
import AllOrders from "./Components/AllOrders/AllOrders";
import Account from "./Components/Account/Account";

function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [isNewSignup, setIsNewSignup] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          return;
        }
        if (user) {
          setUser(user);
          setUserName(user.user_metadata?.username || "Unknown User");
        }
      } catch (err) {
        console.error("Unexpected error fetching user:", err);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change event:", event); // Debugging log
        if (event === "SIGNED_IN") {
          if (session?.user) {
            setUser(session.user);
            setUserName(session.user.user_metadata?.username || "Unknown User");
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setUserName("");
        }
      }
    );

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [isNewSignup]);

  const handleNewSignup = () => {
    setIsNewSignup(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Router>
      <div>
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
          <Route
            path="/orders"
            element={
              user ? <AllOrders onLogout={handleLogout} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/account"
            element={
              user ? <Account onLogout={handleLogout} /> : <Navigate to="/" />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
