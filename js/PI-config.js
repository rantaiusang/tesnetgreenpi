/**
 * pi-config.js - MASTER CONFIGURATION
 * Version: 2.0 (Structure Fixed)
 */

window.APP_CONFIG = {
    
    // ==========================================
    // 1. ENVIRONMENT SETTINGS
    // ==========================================
    
    IS_SANDBOX: true, 

    // Kunci Keamanan Supabase
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpa2FwcXVodXNid2pjY2JxY3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNjQ1NTQsImV4cCI6MjA4NDc0MDU1NH0.X278oHDF0be7oa25484eliSukSYAYvDbJyU6ysz83zA", 

    // ==========================================
    // 2. SUPABASE CONFIGURATION
    // ==========================================
    SUPABASE_URL: "https://lrzaiftdikcjehtlbwlg.supabase.co", 

    ENDPOINTS: {
        LOGIN: "/auth/verify-user-login",
        VERIFY_PAYMENT: "/payments/verify-payment",
        CHECK_STATUS: "/payments/check-status"
    },

    // ==========================================
    // 3. PI NETWORK CONFIGURATION
    // ==========================================
    PI: {
        APP_ID: "26949299605f32",
        SDK_VERSION: "2.0",
        SCOPES: ["username", "payments"]
    }

}; // <--- ⚠️ PENTING: TUTUP OBJECT DI SINI (Sebelum fungsi bantuan)


// ==========================================
// 4. EXPORTS & LOGIC HELPERS
// ==========================================
// Bagian ini BERADA DI LUAR object window.APP_CONFIG

// Helper mendapatkan URL Endpoint
window.getAppUrl = function(endpointKey) {
    if (!window.APP_CONFIG) {
        console.error("Error: APP_CONFIG tidak terdefinisi.");
        return "#";
    }

    const baseUrl = window.APP_CONFIG.SUPABASE_URL;
    const endpoint = window.APP_CONFIG.ENDPOINTS[endpointKey];

    if (!baseUrl || !endpoint) {
        console.error(`Error: Endpoint '${endpointKey}' tidak ditemukan di config.`);
        return "#";
    }

    return `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
};

// Debugging Log saat config dimuat
console.log("✅ Pi-Config Loaded:", {
    Sandbox: window.APP_CONFIG.IS_SANDBOX,
    AppID: window.APP_CONFIG.PI.APP_ID,
    Endpoints: window.APP_CONFIG.ENDPOINTS
});
