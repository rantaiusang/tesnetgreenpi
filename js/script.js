// KONEKSI SUPABASE
const supabase = window.supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_KEY);
let currentUser = null;
let cart = []; // Array menampung { id, name, price }

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
    
    // Load User
    const stored = localStorage.getItem('pak_tani_user');
    if (stored) {
        currentUser = JSON.parse(stored);
        updateAuth(true);
    } else {
        updateAuth(false);
    }

    loadMarketplace();
});

// 3. AUTH & ROLE
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
        adminPanel.style.display = 'none';
    } else {
        authSection.innerHTML = `<button class="btn btn-pi" id="btnLogin">Login Pi</button>`;
        document.getElementById('btnLogin').onclick = login;
        adminPanel.style.display = 'none';
    }
}

window.switchRole = function(role) {
    const panel = document.getElementById('adminPanel');
    panel.style.display = (role === 'seller') ? 'block' : 'none';
}

// 4. MARKETPLACE
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
                    <button class="btn btn-pi" style="background:#fff3cd; color:#333" onclick="addToCart(${p.id}, '${p.name}', ${p.price})">+ Keranjang</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 5. LOGIC KERANJANG (BARU)
window.addToCart = function(id, name, price) {
    cart.push({ id, name, price });
    document.getElementById('cartCount').innerText = cart.length;
    
    // Animasi kecil
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "Masuk!";
    setTimeout(() => btn.innerText = originalText, 500);
}

window.openCart = function() {
    const modal = document.getElementById('cartModal');
    const list = document.getElementById('cartList');
    const totalEl = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        list.innerHTML = "<p>Keranjang kosong.</p>";
        totalEl.innerText = "Rp 0";
    } else {
        let total = 0;
        list.innerHTML = cart.map((item, index) => {
            total += item.price;
            return `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                    <span>${item.name}</span>
                    <div>
                        <strong>Rp ${item.price}</strong>
                        <button onclick="removeFromCart(${index})" style="color:red; background:none; border:none; cursor:pointer; margin-left:10px;">x</button>
                    </div>
                </div>
            `;
        }).join('');
        totalEl.innerText = "Rp " + total;
    }
    
    modal.style.display = 'flex';
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    document.getElementById('cartCount').innerText = cart.length;
    openCart(); // Refresh tampilan
}

window.closeCart = function() {
    document.getElementById('cartModal').style.display = 'none';
}

// 6. LOGIC CHECKOUT & PEMBAYARAN
window.processCheckout = async function() {
    if (!currentUser) {
        alert("Anda harus Login Pi dulu!");
        closeCart();
        return;
    }

    if (cart.length === 0) {
        alert("Keranjang kosong!");
        return;
    }

    // SIMULASI PROSES PEMBAYARAN
    // Di produksi: Anda akan menggunakan Pi.createPayment() di sini
    const totalHarga = cart.reduce((sum, item) => sum + item.price, 0);
    const confirmBuy = confirm(`Total Belanja: Rp ${totalHarga}\n\nBayar dengan Saldo Pi Anda?`);

    if (confirmBuy) {
        // Simpan Order ke Supabase
        const { error } = await supabase.from('order').insert([{
            user_id: currentUser.uid,
            total_amount: totalHarga,
            status: 'paid', // Simulasi sukses bayar
            created_at: new Date()
        }]);

        if (!error) {
            alert("Pembayaran Berhasil! Terima kasih.");
            cart = []; // Kosongkan keranjang
            document.getElementById('cartCount').innerText = "0";
            closeCart();
            // Bisa redirect ke halaman 'Riwayat Pesanan' di sini
        } else {
            alert("Gagal menyimpan order: " + error.message);
        }
    }
}

// FUNGSI SUPPORT
async function buyNow(id) { if(!currentUser) return alert("Login dulu!"); alert("Fitur Beli Langsung segera hadir."); }

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
