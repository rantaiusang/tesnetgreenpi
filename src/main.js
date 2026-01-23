import { loginPi } from "./pi-auth.js"
import { initSupabase, getSupabase } from "./supabase.js"

const statusEl = document.getElementById("status")
const outputEl = document.getElementById("output")

async function startApp() {
  try {
    statusEl.textContent = "Login Pi..."

    // 1. Login Pi
    const piUID = await loginPi()
    console.log("PI UID:", piUID)

    statusEl.textContent = "Connect database..."

    // 2. Init Supabase (SETELAH login)
    initSupabase(piUID)
    const supabase = getSupabase()

    statusEl.textContent = "Load profile..."

    // 3. Test query
    const { data, error } = await supabase
      .from("profiles")
      .select("*")

    if (error) {
      statusEl.textContent = "Error"
      outputEl.textContent = JSON.stringify(error, null, 2)
      return
    }

    statusEl.textContent = "Berhasil"
    outputEl.textContent = JSON.stringify(data, null, 2)

  } catch (err) {
    statusEl.textContent = "Gagal"
    outputEl.textContent = err.message
    console.error(err)
  }
}

startApp()
