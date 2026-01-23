// js/modules/reviews.js

const ReviewsModule = {
    // Kirim ulasan
    // Tabel: 'reviews'
    async submitReview(userId, productId, rating, comment) {
        const { data, error } = await supabase
            .from('reviews')
            .insert({
                user_id: userId,
                product_id: productId,
                rating: rating, // 1-5
                comment: comment,
                created_at: new Date()
            });

        return !error;
    },

    // Ambil ulasan untuk satu produk
    async getProductReviews(productId) {
        const { data } = await supabase
            .from('reviews')
            .select(`
                *,
                profiles(username, avatar)
            `)
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        return data || [];
    }
};
