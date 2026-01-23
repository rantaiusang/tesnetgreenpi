// src/config.js
import { createClient } from '@supabase/supabase-js'

// ==========================
// Supabase Configuration
// ==========================
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    headers: {
      'x-pi-uid': window.piUID || '' // otomatis ambil Pi UID saat login
    }
  }
})

// ==========================
// Pi App Configuration
// ==========================
export const PI_APP_ID = import.meta.env.VITE_PI_APP_ID
export const PI_WALLET_ADDRESS = import.meta.env.VITE_PI_WALLET_ADDRESS

// ==========================
// Pi SDK Init
// ==========================
export const initPiSDK = () => {
  if (!window.Pi) {
    console.error('Pi SDK not loaded')
    return
  }

  window.Pi.setup({
    appId: PI_APP_ID,
    sandbox: true // gunakan sandbox untuk testing
  })

  console.log('Pi SDK initialized with App ID:', PI_APP_ID)
}

// ==========================
// Helper: Auto-insert profile jika belum ada
// ==========================
export const autoInsertProfile = async (piUID, profileData) => {
  if (!piUID) return

  // cek apakah profile sudah ada
  const { data: existing, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('pi_uid', piUID)
    .single()

  if (error && error.code !== 'PGRST116') { // 116 = not found
    console.error('Error checking profile:', error)
    return
  }

  if (!existing) {
    const { data, error: insertError } = await supabase
      .from('profiles')
      .insert([{ pi_uid: piUID, ...profileData }])
      .select()
    
    if (insertError) {
      console.error('Error inserting profile:', insertError)
      return
    }

    console.log('Profile auto-inserted:', data)
  } else {
    console.log('Profile already exists:', existing)
  }
}
