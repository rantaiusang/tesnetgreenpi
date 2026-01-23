import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js"

let supabase = null

export function initSupabase(piUID) {
  supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          "x-pi-uid": piUID
        }
      }
    }
  )
}

export function getSupabase() {
  if (!supabase) {
    throw new Error("Supabase belum di-init")
  }
  return supabase
}
