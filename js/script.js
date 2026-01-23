// Koneksi Supabase
const supabase = window.supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_KEY);
let currentUser = null;
let cart = [];

// 1. LOAD PI SDK
function loadPiSDK() {
    return new Promise(resolve => {
        if (window.Pi) { window.Pi.init({ version: "2.0", sandbox: true }); resolve(); return; }
        const script = document.createElement('script');
        script.src = "https://sdk.minepi.com/pi-sdk.js";
        script.onload = () => { window.Pi.init({ version: "2.0", sandbox: true }); resolve(); };
        document.body.appendChild(script);
    });
}

// 2. INIT
document.addEventListener('DOMContentLoaded', async () => {
    await loadPiSDK();
    const stored = localStorage.getItem('pak_tani_user');
    if (stored) {
        currentUser = JSON.parse(stored);
        updateAuth(true);
    } else {
        updateAuth(false);
    }
    loadMarketplace();
});

// 3. UPDATE AUTH & ROLE
function updateAuth(isLoggedIn) {
    const authSection = document.getElementById('authSection');
    const adminPanel = document.getElementById('adminPanel');

    if (isLoggedIn) {
        authSection.innerHTML = `
            <select id="roleSelector" style="padding:8px; border-radius:5px;" onchange="switchRole(this.value)">
                <option value="buyer">Mode Pembeli</option>
                <option value="seller">Mode Penjual</option>
            </select>
            <button class="btn btn-pi" style="background:#555" onclick="logout()">Keluar</button>
        `;
        adminPanel.style.display = 'none'; // Default hidden
    } else {
        authSection.innerHTML = `<button class="btn btn-pi" id="btnLogin">Login Pi</button>`;
        document.getElementById('btnLogin').onclick = login;
        adminPanel.style.display = 'none';
    }
}

// 4. SWITCH ROLE
window.switchRole = function(role) {
    const panel = document.getElementById('adminPanel');
    if (role === 'seller') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

// 5. LOAD MARKETPLACE
async function loadMarketplace() {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    const container = document.getElementById('productGrid');
    document.getElementById('loading').style.display = 'none';

    container.innerHTML = data.map(p => `
        <div class="card">
            <img src="${p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}" alt="${p.name}">
            <div class="card-body">
                <h3>${p.name}</h3>
                <div class="card-price">Rp ${p.price}</div>
                <div class="btn-group">
                    <button class="btn btn-buy" onclick="buyNow(${p.id})">Beli</button>
                    <button class="btn btn-pi" style="background:#fff3cd; color:#333" onclick="addToCart(${p.id})">+ Keranjang</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 6. FUNCTIONS
function addToCart(id) { cart.push({id}); document.getElementById('cartCount').innerText = cart.length; }
async function buyNow(id) { if(!currentUser) return alert("Login dulu!"); alert("Fitur Pembayaran Pi segera hadir!"); }

async function saveProduct() {
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    const img = document.getElementById('pImg').value;
    const desc = document.getElementById('pDesc').value;
    if(!name || !price) return alert("Isi nama & harga!");
    
    const { error } = await supabase.from('products').insert([{name, price, image_url: img, description: desc, is_active: true}]);
    if(!error) { alert("Sukses!"); document.getElementById('uploadForm').reset(); loadMarketplace(); } 
    else alert("Gagal: "+error.message);
}

async function login() { try { const res = await window.Pi.authenticate(); currentUser = res.user; localStorage.setItem('pak_tani_user', JSON.stringify(currentUser)); updateAuth(true); } catch(e){alert("Gagal");} }
function logout() { localStorage.removeItem('pak_tani_user'); location.reload(); }
