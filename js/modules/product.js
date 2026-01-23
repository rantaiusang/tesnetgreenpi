// js/modules/products.js

const ProductsModule = {
    // Mengambil semua produk aktif
    // Tabel: 'products'
    async getAllProducts() {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                profiles:profiles(username) // Join tabel profil untuk nama penjual
            `)
            .eq('is_active', true) // Asumsi ada kolom status
            .order('created_at', { ascending: false });

        if (error) console.error("Error fetch products:", error);
        return data || [];
    },

    // Mengambil produk unggulan saja
    // Tabel: 'featured_products' (Join ke 'products')
    async getFeaturedProducts() {
        const { data, error } = await supabase
            .from('featured_products')
            .select(`
                products(*)
            `);

        if (error) console.error("Error fetch featured:", error);
        
        // Mapping hasil join agar datanya rapi
        return data ? data.map(item => item.products).filter(p => p) : [];
    },

    // Ambil detail satu produk
    // Tabel: 'products'
    async getProductById(productId) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        return data || null;
    }
};
