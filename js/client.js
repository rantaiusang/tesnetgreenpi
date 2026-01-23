// js/client.js

import { SupabaseConfig } from './config.js';

// Inisialisasi Supabase Client
// Menggunakan createClient dari window (karena load via CDN)
const { createClient } = window.supabase;

const supabase = createClient(
    SupabaseConfig.URL, 
    SupabaseConfig.KEY
);

// Export supabase agar bisa dipakai file lain (profile.js, order.js, dll)
export default supabase;
