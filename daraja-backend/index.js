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

// Supabase client
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Generate OAuth token
const getToken = async () => {
  const auth = Buffer.from(`${DARAJA_CONSUMER_KEY}:${DARAJA_CONSUMER_SECRET}`).toString("base64");
  const { data } = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  return data.access_token;
};

// Initiate STK Push
router.post("/stk-push", async (req, res) => {
  const { phone, amount, accountReference, transactionDesc } = req.body;

  if (!phone || !amount || !accountReference) {
    return res.status(400).json({ error: "Missing phone, amount, or reference." });
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
        AccountReference: accountReference,
        TransactionDesc: transactionDesc || "Loan repayment via ChamaPro",
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
    res.status(500).json({ error: "STK push failed" });
  }
});

// Handle Safaricom STK Callback
router.post("/callback", async (req, res) => {
  const callback = req.body?.Body?.stkCallback;

  if (!callback || callback.ResultCode !== 0) {
    console.log("❌ Payment was not successful or cancelled.");
    return res.status(200).send("Payment not completed");
  }

  const metadata = callback.CallbackMetadata?.Item || [];
  const phone = metadata.find((i) => i.Name === "PhoneNumber")?.Value;
  const amount = metadata.find((i) => i.Name === "Amount")?.Value;
  const accountReference = callback?.MerchantRequestID || ""; // fallback to identify loan

  // Example: LoanRepayment-12345
  const refText = metadata.find((i) => i.Name === "AccountReference")?.Value || "";
  const loanId = refText?.startsWith("LoanRepayment-")
    ? refText.split("LoanRepayment-")[1]
    : null;

  if (!phone || !amount || !loanId) {
    console.error("⚠️ Missing phone, amount or loan ID");
    return res.status(400).send("Missing transaction data");
  }

  // Prevent duplicate entry (optional)
  const { data: existing } = await supabase
    .from("loan_payments")
    .select("id")
    .eq("loan_id", loanId)
    .eq("amount", amount)
    .gte("paid_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()) // within 5 minutes
    .limit(1)
    .maybeSingle();

  if (existing) {
    console.log("⚠️ Duplicate payment attempt blocked.");
    return res.status(200).send("Already recorded.");
  }

  const { error } = await supabase.from("loan_payments").insert([
    {
      loan_id: loanId,
      amount: amount,
      type: "principal",
      paid_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("❌ Failed to insert loan repayment:", error.message);
    return res.status(500).send("Failed to record");
  }

  console.log(`✅ Loan repayment of ${amount} recorded for Loan ID: ${loanId}`);
  res.status(200).send("OK");
});

module.exports = router;
