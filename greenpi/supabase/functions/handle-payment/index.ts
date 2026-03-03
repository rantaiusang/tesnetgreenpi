import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ================= CONFIG =================
const PI_API_KEY = Deno.env.get("PI_SECRET_KEY"); // WAJIB dari ENV
const PI_BASE_URL = "https://api.minepi.com/v2/payments/";

// CORS HEADERS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {

  // 1️⃣ HANDLE CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }

  if (!PI_API_KEY) {
    console.error("PI_SECRET_KEY not set in environment variables");
    return new Response(
      JSON.stringify({ error: "Server misconfiguration" }),
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const { paymentId, action } = await req.json();

    console.log(`Incoming: action=${action}, paymentId=${paymentId}`);

    if (!paymentId || !action) {
      return new Response(
        JSON.stringify({ error: "Missing paymentId or action" }),
        { status: 400, headers: corsHeaders }
      );
    }

    let endpoint = "";
    let method = "POST";

    // ================= ACTION HANDLER =================

    if (action === "approve") {
      endpoint = `${PI_BASE_URL}${paymentId}/approve`;
    }

    else if (action === "complete") {
      // ⚠️ V2 COMPLETE TIDAK BOLEH ADA BODY
      endpoint = `${PI_BASE_URL}${paymentId}/complete`;
    }

    else if (action === "cancel") {
      endpoint = `${PI_BASE_URL}${paymentId}/cancel`;
    }

    else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("Calling Pi:", endpoint);

    // ================= CALL PI API =================

    const piResponse = await fetch(endpoint, {
      method,
      headers: {
        "Authorization": `Key ${PI_API_KEY}`,
      }
    });

    const data = await piResponse.json();

    if (!piResponse.ok) {
      console.error("Pi API Error:", data);
      return new Response(
        JSON.stringify({
          error: data?.error || "Pi API Error",
          details: data
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log("Pi Success:", data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );

  } catch (err) {
    console.error("Internal Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
