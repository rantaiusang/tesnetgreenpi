// js/profile.js

import supabase from './client.js';
import { Tables } from './config.js';

const ProfileModule = {
    // Fungsi menyimpan data user saat login pertama kali
    // Tabel: 'profiles'
    async upsertUser(piUser) {
        const { data, error } = await supabase
            .from(Tables.PROFILES)
            .upsert({
                id: piUser.uid,
                username: piUser.username,
                avatar: piUser.avatar,
                updated_at: new Date()
            })
            .select()
            .single();

        if (error) {
            console.error("Gagal sync profile:", error);
            return null;
        }
        return data;
    },

    // Fungsi cek apakah user sudah ada di database
    // Tabel: 'profiles'
    async getUserById(userId) {
        const { data, error } = await supabase
            .from(Tables.PROFILES)
            .select('*')
            .eq('id', userId)
            .single();

        return data || null;
    }
};

export default ProfileModule;
