// js/modules/auth.js

const AuthModule = {
    // Mendaftarkan user baru atau update data jika login ulang
    // Tabel: 'profiles', 'wallet_address'
    async syncUser(piUser, walletAddress) {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: piUser.uid, // Menggunakan UID Pi sebagai Primary Key
                username: piUser.username,
                avatar: piUser.avatar || null,
                updated_at: new Date()
            })
            .select()
            .single();

        if (error) {
            console.error("Gagal sync profile:", error);
            return null;
        }

        // Simpan alamat wallet ke tabel wallet_address
        if (walletAddress) {
            await supabase.from('wallet_address').upsert({
                user_id: piUser.uid,
                address: walletAddress,
                network: 'Pi'
            });
        }

        return data;
    },

    // Ambil profil user berdasarkan ID
    // Tabel: 'profiles'
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        return data || null;
    },

    // Logout logic
    logout() {
        // Logic logout Pi Network jika ada
        localStorage.removeItem('pak_tani_user');
        window.location.reload();
    }
};
