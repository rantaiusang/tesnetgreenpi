// js/order.js

import supabase from './client.js';
import { Tables } from './config.js';

const OrderModule = {
    // Membuat Order baru
    // Tabel: 'order'
    async createOrder(userId, totalAmount) {
        const { data, error } = await supabase
            .from(Tables.ORDER)
            .insert({
                user_id: userId,
                total_amount: totalAmount,
                status: 'pending', // pending, paid, shipped
                created_at: new Date()
            })
            .select()
            .single();

        if (error) {
            console.error("Gagal membuat order:", error);
            return null;
        }
        return data;
    },

    // Menambahkan item ke dalam order
    // Tabel: 'order_item'
    async addOrderItems(orderId, items) {
        // Mapping cart items ke format database
        const itemsToInsert = items.map(item => ({
            order_id: orderId,
            product_id: item.id,
            quantity: item.qty || 1,
            price_at_purchase: item.price
        }));

        const { error } = await supabase
            .from(Tables.ORDER_ITEM)
            .insert(itemsToInsert);

        if (error) {
            console.error("Gagal insert items:", error);
            return false;
        }
        return true;
    },

    // Mengambil riwayat pesanan user
    async getOrdersByUser(userId) {
        const { data, error } = await supabase
            .from(Tables.ORDER)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        return data || [];
    }
};

export default OrderModule;
