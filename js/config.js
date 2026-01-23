// js/config.js

export const PiConfig = {
  version: "2.0",
  sandbox: true 
};

// Ambil dari Environment Variables (Vercel) atau gunakan default kosong
export const SupabaseConfig = {
  // Di Vercel, ini akan otomatis terisi oleh import.meta.env.VITE_...
  URL: import.meta.env.VITE_SUPABASE_URL || "",
  KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || ""
};

export const Tables = {
    PROFILES: "profiles",
    PRODUCTS: "products",
    // ... dst
};
