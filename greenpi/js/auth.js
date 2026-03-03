// js/auth.js
import { supabase } from './supabase.js';

// Simulasi State User
let currentUser = null;

// Fungsi Login (Dipanggil dari login.html)
export async function handleLogin() {
    const btn = document.getElementById('btn-login');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghubungkan ke Pi Network...';
    btn.disabled = true;

    // SIMULASI PI NETWORK SDK
    // Di real app, gunakan: Pi.authenticate(..., onIncompletePaymentFound)
    setTimeout(async () => {
        // Mock User Data dari Pi Network
        const mockUser = {
            uid: 'PI_' + Math.floor(Math.random() * 100000),
            username: 'Pioneer_' + Math.floor(Math.random() * 1000),
            wallet: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
        };

        // Cek apakah user sudah ada di DB kita
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', mockUser.wallet)
            .single();

        if (!data) {
            // Jika user baru, daftarkan
            const { error: insertError } = await supabase
                .from('users')
                .insert([{ 
                    id: mockUser.uid, 
                    wallet_address: mockUser.wallet,
                    reputation: 100 
                }]);
            
            if(insertError) {
                alert("Gagal mendaftarkan user: " + insertError.message);
                btn.disabled = false;
                btn.innerText = "Coba Lagi";
                return;
            }
        }

        // Simpan sesi di LocalStorage (Agar tidak login ulang saat refresh)
        localStorage.setItem('greenproof_user', JSON.stringify(mockUser));
        
        // Redirect ke Dashboard
        window.location.href = 'dashboard.html';

    }, 1500); // Delay simulasi 1.5 detik
}

// Fungsi Cek Sesi (Dipanggil di dashboard & plant)
export function getSession() {
    const user = localStorage.getItem('greenproof_user');
    return user ? JSON.parse(user) : null;
}

export function logout() {
    localStorage.removeItem('greenproof_user');
    window.location.href = 'login.html';
}
