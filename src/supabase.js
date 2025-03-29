import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // Disable local storage
    storage: {
      getItem: (key) =>
        document.cookie
          .split("; ")
          .find((row) => row.startsWith(key))
          ?.split("=")[1],
      setItem: (key, value) => (document.cookie = `${key}=${value}; path=/;`),
      removeItem: (key) => (document.cookie = `${key}=; Max-Age=0; path=/;`),
    },
  },
});
