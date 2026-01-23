// js/config.js

// 1. Ambil data dari window.env (dari Vercel)
const SUPABASE_URL = window.env?.SUPABASE_URL || "";
const SUPABASE_KEY = window.env?.SUPABASE_KEY || "";

// 2. Validasi ketat
if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
        "ERROR: Environment Variables Vercel tidak terbaca! " +
        "Cek: 1. Apakah sudah set di Vercel Settings? 2. Apakah sudah Redeploy?"
    );
}

// 3. Export konfigurasi Supabase
export const SupabaseConfig = {
    URL: SUPABASE_URL,
    KEY: SUPABASE_KEY
};

// 4. Export konfigurasi Pi SDK
export const PiConfig = {
    version: "2.0",
    sandbox: true,
    auth: true
};

// 5. Export nama tabel
export const Tables = {
    PROFILES: "profiles",
    PRODUCTS: "products",
    FEATURED_PRODUCTS: "featured_products",
    ORDER: "order",
    ORDER_ITEM: "order_item",
    PAYMENT: "payment",
    SHIPPING: "shipping",
    REVIEWS: "reviews",
    WALLET_ADDRESS: "wallet_address" // ✅ perbaikan typo
};
