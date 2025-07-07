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

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// OAuth token
const getToken = async () => {
  const auth = Buffer.from(`${DARAJA_CONSUMER_KEY}:${DARAJA_CONSUMER_SECRET}`).toString("base64");
  const { data } = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return data.access_token;
};

// STK Push endpoint
router.post("/stk-push", async (req, res) => {
  const { phone, amount, accountReference, transactionDesc, type, group_member_id } = req.body;

  console.log("📨 Incoming STK Request:", req.body);

  if (!phone || !amount || !type || !group_member_id) {
    return res.status(400).json({ error: "Missing required fields" });
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
        AccountReference: accountReference || `${type}-${group_member_id}`,
        TransactionDesc: transactionDesc || "Member contribution",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (error) {
    console.error("❌ STK Push Error:", error.response?.data || error.message);
    res.status(500).json({ error: "STK Push failed", details: error.response?.data });
  }
});

// Callback handler
router.post("/callback", async (req, res) => {
  const callback = req.body.Body?.stkCallback;

  if (!callback || callback.ResultCode !== 0) {
    return res.status(200).send("No successful payment.");
  }

  const metadata = callback.CallbackMetadata?.Item || [];
  const phone = metadata.find((i) => i.Name === "PhoneNumber")?.Value;
  const amount = metadata.find((i) => i.Name === "Amount")?.Value;
  const accountReference = callback?.AccountReference || "";

  console.log("✅ Callback Data:", { phone, amount, accountReference });

  const [type, group_member_id] = accountReference.split("-");

  if (!group_member_id || !amount) {
    console.error("❌ Missing group_member_id or amount in callback");
    return res.status(400).send("Missing required values");
  }

  const { error } = await supabase.from("contributions").insert([
    {
      group_member_id,
      amount,
      type: type || "monthly",
      date_contributed: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("❌ Failed to insert contribution:", error.message);
    return res.status(500).send("Contribution record failed");
  }

  return res.status(200).send("Contribution recorded");
});

module.exports = router;
