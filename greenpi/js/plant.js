// js/plant.js
import { supabase } from './supabase.js';
import { getSession } from './auth.js';

export function initPlantPage() {
    const user = getSession();
    if (!user) {
        alert("Sesi habis, silakan login ulang.");
        window.location.href = 'login.html';
        return;
    }

    // Event Listeners
    // Pastikan ID di HTML sesuai dengan yang ada di plant.html
    const btnGps = document.getElementById('btn-gps');
    const fileInput = document.getElementById('file-input');
    const plantForm = document.getElementById('plant-form');
    const removeImgBtn = document.getElementById('remove-img');

    if (btnGps) btnGps.addEventListener('click', getGPS);
    if (fileInput) fileInput.addEventListener('change', handleFileSelect);
    if (plantForm) plantForm.addEventListener('submit', submitPlantData);
    
    // Event listener untuk tombol hapus gambar (jika ada di plant.html versi baru)
    if (removeImgBtn) {
        removeImgBtn.addEventListener('click', () => {
            document.getElementById('file-input').value = ''; // Reset input file
            document.getElementById('img-preview').style.display = 'none';
            document.getElementById('upload-placeholder').style.display = 'block';
            document.getElementById('preview-container').style.display = 'none';
            validateForm();
        });
    }
}

let currentLocation = null;

// 1. Ambil GPS
function getGPS() {
    const statusEl = document.getElementById('gps-status');
    
    // Tampilkan status loading
    statusEl.innerHTML = '<span class="loading-text"><i class="fas fa-spinner fa-spin"></i> Mencari sinyal satelit...</span>';

    if (!navigator.geolocation) {
        statusEl.innerHTML = '<span class="error-text"><i class="fas fa-exclamation-triangle"></i> Browser tidak mendukung GPS</span>';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Isi hidden input
            document.getElementById('gps-lat').value = currentLocation.lat;
            document.getElementById('gps-lng').value = currentLocation.lng;
            
            // Isi display input (read-only)
            document.getElementById('gps-display').value = `${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`;
            
            // Tampilkan sukses
            statusEl.innerHTML = '<span class="success-text"><i class="fas fa-check-circle"></i> Lokasi terkunci akurat.</span>';
            
            // Validasi form agar tombol submit aktif
            validateForm();
        },
        (error) => {
            let msg = "Gagal mengambil lokasi.";
            if(error.code === error.PERMISSION_DENIED) msg = "Izin lokasi ditolak. Harap aktifkan GPS.";
            if(error.code === error.TIMEOUT) msg = "Waktu habis mencari lokasi.";
            
            statusEl.innerHTML = `<span class="error-text"><i class="fas fa-times-circle"></i> ${msg}</span>`;
        },
        {
            enableHighAccuracy: true, // Paksa GPS presisi tinggi
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// 2. Preview Gambar
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        // Batasi ukuran file (Max 5MB) untuk mencegah error di browser
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran gambar terlalu besar. Maksimal 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('img-preview');
            const previewContainer = document.getElementById('preview-container');
            const uploadPlaceholder = document.getElementById('upload-placeholder');
            
            if(preview && previewContainer && uploadPlaceholder) {
                preview.src = e.target.result;
                previewContainer.style.display = 'block';
                uploadPlaceholder.style.display = 'none';
                validateForm();
            }
        };
        reader.readAsDataURL(file);
    }
}

// 3. Validasi Form Sederhana
function validateForm() {
    // Cek apakah input GPS sudah terisi
    const hasGPS = document.getElementById('gps-display').value !== '';
    // Cek apakah sudah ada file yang dipilih
    const hasFile = document.getElementById('file-input').files.length > 0;
    // Cek apakah nama tanaman sudah diisi (untuk fitur baru)
    const plantNameInput = document.getElementById('plant-name');
    const hasName = plantNameInput ? plantNameInput.value.trim() !== '' : true; // True jika input tidak ada (backward compatible)

    const btn = document.getElementById('btn-submit');
    
    // Tombol hanya aktif jika GPS, Foto, dan Nama terisi
    btn.disabled = !(hasGPS && hasFile && hasName);
}

// 4. Submit Data
async function submitPlantData(e) {
    e.preventDefault();
    
    const btn = document.getElementById('btn-submit');
    const originalBtnText = btn.innerHTML;
    
    // Ubah tombol jadi loading
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Mengirim Data...';

    try {
        const user = getSession();
        if (!user) throw new Error("Sesi tidak ditemukan.");

        // Ambil Nama Tanaman (Jika input ada di HTML)
        const plantNameInput = document.getElementById('plant-name');
        const plantName = plantNameInput ? plantNameInput.value : 'Pohon Hijau';

        // Ambil Data Gambar (Base64 untuk demo ini)
        // Di production: Upload ke Supabase Storage dulu, ambil URL-nya
        const photoUrl = document.getElementById('img-preview').src;

        if (!currentLocation) throw new Error("Lokasi GPS belum diambil.");

        // Siapkan Data Object
        const newTree = {
            user_id: user.uid,
            gps_lat: currentLocation.lat,
            gps_long: currentLocation.lng,
            photo_url: photoUrl, 
            status: 'pending',
            credit: 0,
            plant_name: plantName,           // <-- FITUR BARU: Nama Jenis
            planted_at: new Date().toISOString() // <-- FITUR BARU: Waktu Tanam
        };

        // Kirim ke Supabase
        const { error } = await supabase.from('trees').insert([newTree]);

        if (error) {
            console.error("Supabase Error:", error);
            throw error;
        }

        // Sukses
        // Tampilkan notifikasi singkat sebelum redirect
        btn.style.backgroundColor = '#10b981'; // Hijau
        btn.innerHTML = '<i class="fas fa-check"></i> Berhasil!';
        
        setTimeout(() => {
            alert(`Pohon ${plantName} berhasil didaftarkan! Menunggu verifikasi admin.`);
            window.location.href = 'dashboard.html';
        }, 800);

    } catch (error) {
        console.error(error);
        alert('Gagal mengirim data: ' + error.message);
        
        // Kembalikan tombol ke kondisi semula
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
    }
}
