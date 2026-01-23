// js/main.js

// --- 1. IMPORTS ---
import { PiConfig, Tables } from './config.js';
import supabase from './client.js';
import ProfileModule from './profile.js';

// --- 2. STATE ---
let appState = {
    user: null,
    products: []
};

// --- 3. INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("--- App Started ---");

    try {
        // A. Load Pi SDK
        await loadPiSDK();

        // B. Cek User
        const storedUser = localStorage.getItem('pak_tani_user');
        if (storedUser) {
            appState.user = JSON.parse(storedUser);
            console.log("User found in storage:", appState.user);
            
            // Sync ke Supabase
            await ProfileModule.upsertUser(appState.user);
            
            // Update Teks Welcome
            document.getElementById('welcome').innerHTML = `
                ✅ Pi SDK & Login berhasil<br>
                User: ${appState.user.username} (UID: ${appState.user.uid})
            `;
            
            // Update Tombol
            updateAuthUI(true);
        } else {
            document.getElementById('welcome').innerText = "Silakan Login...";
            updateAuthUI(false);
        }

        // C. Fetch Products (Bagian yang mungkin error)
        console.log("Fetching products...");
        await fetchProducts(); 

        // D. Tampilkan Konten
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('app').classList.remove('hidden');
            console.log("App displayed");
        }, 500);

    } catch (error) {
        console.error("CRITICAL ERROR DI MAIN.JS:", error);
        document.getElementById('welcome').innerText = "Terjadi kesalahan sistem. Cek Console (F12).";
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }
});

// --- 4. FUNCTIONS ---

function loadPiSDK() {
    return new Promise((resolve) => {
        if (window.Pi) {
            window.Pi.init(PiConfig);
            resolve();
            return;
        }
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
    try {
        const authResult = await window.Pi.authenticate();
        appState.user = authResult.user;
        localStorage.setItem('pak_tani_user', JSON.stringify(appState.user));
        await ProfileModule.upsertUser(appState.user);
        
        document.getElementById('welcome').innerHTML = `Login Berhasil! Halo ${appState.user.username}`;
        updateAuthUI(true);
        await fetchProducts(); // Coba fetch ulang setelah login
    } catch (err) {
        console.error(err);
        alert("Login Gagal");
    }
}

async function fetchProducts() {
    const container = document.getElementById('products');
    
    // 1. Cek apakah container ada di HTML
    if (!container) {
        console.error("ID 'products' TIDAK DITEMUKAN di HTML!");
        return;
    }

    container.innerHTML = '<p>Memuat data...</p>';

    // 2. Query Supabase
    console.log("Menghubungi Supabase:", Tables.PRODUCTS);
    
    const { data, error } = await supabase
        .from(Tables.PRODUCTS)
        .select(`*`) // Sederhanakan dulu querynya, coba tanpa join profiles
        .limit(5);    // Batasi 5 data saja untuk test

    // 3. Handle Error/Success
    if (error) {
        console.error("Supabase Error:", error);
        container.innerHTML = `
            <div style="color:red; padding:20px; border:1px solid red;">
                <strong>Gagal mengambil produk:</strong><br>
                ${error.message}<br>
                <small>Cek Console (F12) untuk detail.</small>
            </div>
        `;
    } else {
        console.log("Data produk diterima:", data);
        appState.products = data;
        renderProducts(data);
    }
}

function renderProducts(products) {
    const container = document.getElementById('products');
    
    if (!products || products.length === 0) {
        container.innerHTML = "<p>Belum ada data produk di database.</p>";
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="card" style="margin-bottom:20px;">
            <img src="${p.image_url || 'https://picsum.photos/200'}" style="width:100%; height:150px; object-fit:cover;">
            <div style="padding:10px;">
                <h4>${p.name}</h4>
                <p style="color:green; font-weight:bold;">Rp ${p.price}</p>
            </div>
        </div>
    `).join('');
}

function updateAuthUI(isLoggedIn) {
    const section = document.getElementById('authSection');
    if(isLoggedIn) {
        section.innerHTML = `<button class="btn btn-outline" onclick="localStorage.removeItem('pak_tani_user');location.reload();">Logout</button>`;
    } else {
        section.innerHTML = `<button id="btnLogin" class="btn btn-pi">Login Pi</button>`;
        document.getElementById('btnLogin').onclick = handleLogin;
    }
}
