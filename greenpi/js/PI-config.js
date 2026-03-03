/**
 * pi-config.js - MASTER CONFIGURATION
 * Version: 2.0 (Koklais Optimized)
 * 
 * File ini adalah "otak" dari koneksi aplikasi Anda ke Pi Network.
 * Pastikan ANON_KEY dan URL sudah benar sebelum deploy.
 */

window.APP_CONFIG = {
    
    // ==========================================
    // 1. ENVIRONMENT SETTINGS
    // ==========================================
    
    // UBAH KE 'false' JIKA SUDAH SIAP LIVE DI MAINNET
    // Pastikan mengubah App Type di developers.pi.net juga
    IS_SANDBOX: false, 

    // Kunci Keamanan Supabase (Public Anon Key)
    // Dapatkan dari: Project Settings > API > anon public
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpa2FwcXVodXNid2pjY2JxY3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNjQ1NTQsImV4cCI6MjA4NDc0MDU1NH0.X278oHDF0be7oa25484eliSukSYAYvDbJyU6ysz83zA", 
    // ^^^ GANTI KEY DI ATAS DENGAN KEY ASLI ANDA ^^^


    // ==========================================
    // 2. SUPABASE CONFIGURATION (Diperlukan untuk Dashboard Web)
    // ==========================================

    // GANTI INI DENGAN URL SUPABASE ANDA
    SUPABASE_URL: "https://lrzaiftdikcjehtlbwlg.supabase.co", 
    // ^^^ GANTI URL DI ATAS ^^^

    // ENDPOINTS (Dibutuhkan untuk sinkronisasi Backend Custom Anda)
    ENDPOINTS: {
        LOGIN: "/auth/verify-user-login",        // Endpoint login yang ada di backend functions
        VERIFY_PAYMENT: "/payments/verify-payment", // Endpoint verifikasi pembayaran
        CHECK_STATUS: "/payments/check-status"    // Endpoint cek status
    },

    // ==========================================
    // 3. PI NETWORK CONFIGURATION
    // ==========================================

    PI: {
        APP_ID: "26949299605f32", // GANTI DENGAN APP ID DARI PIONE CONSOLE
        SDK_VERSION: "2.0",
        SCOPES: ["username", "payments"]
    },

    /**
     * ==========================================
     * 4. EXPORTS & LOGIC HELPERS
     * ==========================================
     */

    // Helper mendapatkan URL Endpoint (Gabungkan BASE_URL dengan Endpoint Key)
    window.getAppUrl = function(endpointKey) {
        if (!window.APP_CONFIG) {
            console.error("Error: APP_CONFIG tidak terdefinisi. Pastikan file ini diload dengan benar.");
            return "#";
        }

        const baseUrl = window.APP_CONFIG.SUPABASE_URL;
        const endpoint = window.APP_CONFIG.ENDPOINTS[endpointKey];

        if (!baseUrl || !endpoint) {
            console.error(`Error: Endpoint '${endpointKey}' tidak ditemukan di config.`);
            return "#";
        }

        // Gabungkan URL dan Endpoint, menghapus double slash
        return `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    };

    // Debugging Log saat config dimuat
    console.log("✅ Pi-Config Loaded:", {
        Supabase: window.APP_CONFIG.SUPABASE_URL.substring(0, 20) + "...", // Tampilkan sebagian URL demi keamanan
        Endpoints: window.APP_CONFIG.ENDPOINTS,
        Pi: window.APP_CONFIG.PI
    });
