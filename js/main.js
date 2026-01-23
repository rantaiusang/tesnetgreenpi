// js/main.js

// --- 1. IMPORT MODULES & CONFIG ---
import { PiConfig, Tables } from './config.js';
import supabase from './client.js';      // Import koneksi DB
import ProfileModule from './profile.js'; // Import logic User
import OrderModule from './order.js';    // Import logic Order

// --- 2. STATE GLOBAL ---
let appState = {
    user: null,    // Data dari Pi Network
    profile: null, // Data dari Tabel Supabase 'profiles'
    products: []
};

// --- 3. INIT APLIKASI ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Pak Tani App Start...");

    // A. Load Pi SDK
    await loadPiSDK();

    // B. Cek Login Session
    const storedUser = localStorage.getItem('pak_tani_user');
    if (storedUser) {
        appState.user = JSON.parse(storedUser);
        
        // Ambil data detail profil dari Supabase (ProfileModule)
        appState.profile = await ProfileModule.getUserById(appState.user.uid);
        
        updateUI(true);
        document.getElementById('welcome').textContent = `Halo, ${appState.user.username}!`;
    } else {
        updateUI(false);
        document.getElementById('welcome').textContent = "Silakan login untuk mulai.";
    }

    // C. Load Produk
    await fetchProducts();

    // D. Tampilkan App (Hilangkan Loading)
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }, 1000);
});

// --- 4. LOGIKA PI NETWORK ---
function loadPiSDK() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = "https://sdk.minepi.com/pi-sdk.js";
        script.onload = () => {
            window.Pi.init(PiConfig);
            resolve();
        };
        document.body.appendChild(script);
    });
}

async function handleLogin() {
    if (!window.Pi) return alert("SDK belum siap");

    try {
        const authResult = await window.Pi.authenticate();
        appState.user = authResult.user;
        
        // Simpan ke LocalStorage
        localStorage.setItem('pak_tani_user', JSON.stringify(appState.user));

        // Sync ke Supabase (ProfileModule)
        // Ini akan menyimpan/insert user ke tabel 'profiles'
        await ProfileModule.upsertUser(appState.user);

        // Update UI
        updateUI(true);
        document.getElementById('welcome').textContent = `Login Berhasil! Halo, ${appState.user.username}`;
        alert("Login Berhasil!");

    } catch (err) {
        console.error(err);
        alert("Login gagal.");
    }
}

function handleLogout() {
    localStorage.removeItem('pak_tani_user');
    appState.user = null;
    appState.profile = null;
    updateUI(false);
    window.location.reload();
}

// --- 5. LOGIKA SUPABASE PRODUK ---
async function fetchProducts() {
    const { data, error } = await supabase
        .from(Tables.PRODUCTS)
        .select(`*, ${Tables.PROFILES}(username)`)
        .limit(10);

    if (error) {
        console.error(error);
    } else {
        appState.products = data;
        renderProducts(data);
    }
}

// --- 6. RENDER UI ---
function renderProducts(products) {
    const container = document.getElementById('products');
    if(!products) return;

    container.innerHTML = products.map(p => {
        const img = p.image_url || `https://picsum.photos/seed/${p.id}/300/200`;
        const price = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(p.price);

        return `
        <div class="card">
            <img src="${img}" class="card-img" alt="${p.name}">
            <div class="card-body">
                <h3 class="card-title">${p.name}</h3>
                <div class="card-price">${price}</div>
                <div class="card-meta">
                    <span><i class="fa-solid fa-user"></i> ${p.profiles?.username || 'Petani'}</span>
                </div>
                <div class="card-actions">
                    <!-- Contoh tombol beli yang memanggil OrderModule -->
                    <button class="btn btn-primary" onclick="alert('Membuat order via OrderModule...')">
                        Beli Sekarang
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function updateUI(isLoggedIn) {
    const authSection = document.getElementById('authSection');
    if(isLoggedIn) {
        authSection.innerHTML = `
            <div style="display:flex; gap:10px; align-items:center;">
                <span>${appState.user.username}</span>
                <button id="btnLogout" class="btn btn-outline">Logout</button>
            </div>
        `;
        document.getElementById('btnLogout').onclick = handleLogout;
    } else {
        authSection.innerHTML = `<button id="btnLogin" class="btn btn-pi">Login Pi</button>`;
        document.getElementById('btnLogin').onclick = handleLogin;
    }
}
