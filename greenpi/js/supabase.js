// js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Ambil config dari variabel global yang di-set oleh pi-config.js
const config = window.APP_CONFIG;

// --- VALIDASI KRUSIAL ---
// Memastikan config sebelum membuat koneksi Supabase
if (!config || !config.SUPABASE_URL || !config.SUPabase_ANON_KEY) {
    console.error("❌ Error: Konfigurasi Supabase hilang. Pastikan file pi-config.js sudah diload dengan benar.");
    // Fallback ke console error agar developer tahu salahnya di mana
} else {
    // Baris debug sederhana untuk memastikan config termuat sebelum masuk logika utama
    console.log("✅ Konfigurasi Supabase dimuat dari APP_CONFIG.");
}

// Inisialisasi Client HANYA jika config tersedia
export const supabase = createClient(
    config.SUPABASE_URL, 
    config.SUPABASE_ANON_KEY
);

// Fungsi Opsional untuk mengecek koneksi saat dev
export const checkConnection = async () => {
    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) {
            console.error("❌ Koneksi Supabase Gagal:", error.message);
            return false;
        }
        console.log("✅ Koneksi Supabase Berhasil.");
        return true;
    } catch (e) {
        console.error("❌ Error Cek Koneksi:", e);
        return false;
    }
};
