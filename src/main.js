import { initPiSDK, autoInsertProfile } from './config.js'

// Inisialisasi Pi SDK
initPiSDK()

// Ambil piUID setelah login
const piUID = window.piUID

// Auto-insert profile jika belum ada
autoInsertProfile(piUID, {
  name: 'Nama Petani',
  phone: '08123456789',
  location: 'Desa Contoh'
})
