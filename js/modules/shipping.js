// js/modules/shipping.js

const ShippingModule = {
    // Simpan atau update alamat pengiriman
    // Tabel: 'shipping'
    async saveAddress(userId, addressData) {
        // addressData: { recipient_name, phone, full_address, city, province }
        const { data, error } = await supabase
            .from('shipping')
            .upsert({
                user_id: userId,
                ...addressData,
                updated_at: new Date()
            })
            .select()
            .single();

        if (error) {
            console.error("Gagal save shipping:", error);
            return null;
        }
        return data;
    },

    // Ambil alamat default user
    async getAddress(userId) {
        const { data } = await supabase
            .from('shipping')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .single();
            
        return data;
    }
};
