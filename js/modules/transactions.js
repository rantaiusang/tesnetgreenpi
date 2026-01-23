// js/modules/transactions.js

const TransactionsModule = {
    // Membuat Order Baru
    // Tabel: 'order'
    async createOrder(userId, totalAmount) {
        const { data, error } = await supabase
            .from('order') // Pastikan nama tabel ini persis di DB
            .insert({
                user_id: userId,
                total_amount: totalAmount,
                status: 'pending', // pending, paid, shipped, completed
                created_at: new Date()
            })
            .select()
            .single();

        if (error) {
            console.error("Gagal create order:", error);
            return null;
        }
        return data;
    },

    // Memasukkan item-item ke dalam pesanan
    // Tabel: 'order_item'
    async addOrderItems(orderId, cartItems) {
        const itemsToInsert = cartItems.map(item => ({
            order_id: orderId,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.price
        }));

        const { error } = await supabase
            .from('order_item')
            .insert(itemsToInsert);

        if (error) console.error("Gagal insert order items:", error);
        return !error;
    },

    // Mengambil riwayat pesanan user
    async getUserOrders(userId) {
        const { data, error } = await supabase
            .from('order')
            .select(`
                *,
                order_item(*, products(name, image_url))
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        return data || [];
    }
};
