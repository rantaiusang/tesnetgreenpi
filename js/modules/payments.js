// js/modules/payments.js

const PaymentsModule = {
    // Mencatat transaksi pembayaran setelah Pi Networkapprove
    // Tabel: 'payment'
    async recordPayment(orderId, txId, amountPi) {
        const { data, error } = await supabase
            .from('payment')
            .insert({
                order_id: orderId,
                transaction_id: txId, // TX ID dari Blockchain Pi
                amount: amountPi,
                payment_method: 'Pi Network',
                status: 'success',
                payment_date: new Date()
            });

        if (error) {
            console.error("Gagal record payment:", error);
            return false;
        }
        return true;
    },

    // Update status Order jadi 'paid' setelah payment sukses
    async markOrderAsPaid(orderId) {
        const { error } = await supabase
            .from('order')
            .update({ status: 'paid' })
            .eq('id', orderId);

        return !error;
    }
};
