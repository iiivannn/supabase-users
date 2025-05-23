import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function setCookie(name, value, days = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Strict`;
}

function removeCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        return getCookie(key);
      },
      setItem: (key, value) => {
        setCookie(key, value, 90);

        if (key === "sb-access-token" || key === "sb-refresh-token") {
          setCookie(key, value, 90);
        }
      },
      removeItem: (key) => {
        removeCookie(key);
      },
    },
  },
});

supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("Auth event:", event);

  if (event === "SIGNED_IN" && session) {
    console.log("User signed in, ensuring persistence");

    setCookie("sb-access-token", session.access_token, 90);
    setCookie("sb-refresh-token", session.refresh_token, 90);

    if (session.user) {
      setCookie("user-id", session.user.id, 90);
    }
  } else if (event === "SIGNED_OUT") {
    console.log("User signed out, clearing cookies");

    [
      "sb-access-token",
      "sb-refresh-token",
      "supabase-auth-token",
      "user-id",
    ].forEach((name) => {
      removeCookie(name);
    });
  } else if (event === "TOKEN_REFRESHED" && session) {
    console.log("Token refreshed, updating cookies");

    // Update stored tokens
    setCookie("sb-access-token", session.access_token, 90);
    setCookie("sb-refresh-token", session.refresh_token, 90);
  }
});

export async function ensureSession() {
  try {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      console.log("No active session, checking for tokens in cookies");

      // Try to restore from cookies
      const accessToken = getCookie("sb-access-token");
      const refreshToken = getCookie("sb-refresh-token");

      if (accessToken && refreshToken) {
        console.log("Found tokens, attempting to restore session");

        return await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }

      return { data: { session: null }, error: new Error("No session found") };
    }

    return { data: data, error: null };
  } catch (err) {
    console.error("Session check error:", err);
    return { data: { session: null }, error: err };
  }
}

(async function () {
  try {
    await ensureSession();
  } catch (err) {
    console.error("Initial session recovery error:", err);
  }
})();

export async function secureLogout(deviceId) {
  try {
    if (deviceId) {
      console.log("Releasing device:", deviceId);

      let attempts = 0;
      let updateSuccess = false;

      while (attempts < 3 && !updateSuccess) {
        attempts++;

        const { error: updateError } = await supabase
          .from("unit_devices")
          .update({
            user_id: null,
            username: null,
            isLogout: true,
            isOccupied: false,
          })
          .eq("device_id", deviceId);

        if (updateError) {
          console.error(
            `Device update attempt ${attempts} failed:`,
            updateError
          );
          if (attempts < 3) await new Promise((r) => setTimeout(r, 300));
        } else {
          console.log("Device successfully released");
          updateSuccess = true;
        }
      }

      if (!updateSuccess) {
        console.error("Failed to update device after multiple attempts");
        // Continue with logout anyway
      }
    } else {
      console.warn("No deviceId provided for logout");
    }

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("Error signing out:", signOutError);
      return { success: false, error: signOutError };
    }

    [
      "sb-access-token",
      "sb-refresh-token",
      "supabase-auth-token",
      "user-id",
      "device-id",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      removeCookie(key);
    });

    return { success: true };
  } catch (error) {
    console.error("Secure logout failed:", error);
    return { success: false, error };
  }
}
