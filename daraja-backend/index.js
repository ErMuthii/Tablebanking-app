const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const {
  DARAJA_CONSUMER_KEY,
  DARAJA_CONSUMER_SECRET,
  DARAJA_SHORTCODE,
  DARAJA_PASSKEY,
  CALLBACK_URL,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

// Supabase client (server-side)
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Get OAuth Token
const getToken = async () => {
  const auth = Buffer.from(`${DARAJA_CONSUMER_KEY}:${DARAJA_CONSUMER_SECRET}`).toString("base64");
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  return response.data.access_token;
};

// STK Push
router.post("/stk-push", async (req, res) => {
  const { phone, amount } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ error: "Phone and amount are required" });
  }

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, -3);
  const password = Buffer.from(`${DARAJA_SHORTCODE}${DARAJA_PASSKEY}${timestamp}`).toString("base64");

  try {
    const token = await getToken();

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: DARAJA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: DARAJA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: CALLBACK_URL,
        AccountReference: "TableBank",
        TransactionDesc: "Contribution",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("STK Push Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || "Internal server error" });
  }
});

// Callback Route
router.post("/callback", async (req, res) => {
  console.log("📩 Received M-Pesa Callback:", JSON.stringify(req.body, null, 2));

  const callback = req.body.Body?.stkCallback;
  if (!callback || callback.ResultCode !== 0) {
    console.log("❌ Payment failed or cancelled.");
    return res.status(200).send("Ignored");
  }

  const metadata = callback.CallbackMetadata?.Item;
  const phone = metadata?.find((i) => i.Name === "PhoneNumber")?.Value;
  const amount = metadata?.find((i) => i.Name === "Amount")?.Value;

  if (!phone || !amount) {
    console.log("⚠️ Missing phone or amount in callback.");
    return res.status(400).send("Missing data");
  }

  // Step 1: Find user profile by phone number
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone_number", phone.toString())
    .maybeSingle();

  if (!profile) {
    console.log("❌ No profile found for phone:", phone);
    return res.status(404).send("Profile not found");
  }

  // Step 2: Find group_member_id
  const { data: groupMember } = await supabase
    .from("group_members")
    .select("id")
    .eq("member_id", profile.id)
    .maybeSingle();

  if (!groupMember) {
    console.log("❌ No group member found for profile ID:", profile.id);
    return res.status(404).send("Group member not found");
  }

  // Step 3: Insert contribution
  const { error } = await supabase.from("contributions").insert([
    {
      group_member_id: groupMember.id,
      amount,
      type: "monthly",
      date_contributed: new Date().toISOString().split("T")[0],
    },
  ]);

  if (error) {
    console.error("❌ Failed to insert contribution:", error.message);
    return res.status(500).send("Insert failed");
  }

  console.log("✅ Contribution inserted successfully for phone:", phone);
  res.status(200).send("OK");
});

module.exports = router;
