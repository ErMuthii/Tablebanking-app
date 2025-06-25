// index.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_CALLBACK_URL,
} = process.env;

// Generate OAuth Token
const getToken = async () => {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  return response.data.access_token;
};

// STK Push Endpoint
router.post("/stk-push", async (req, res) => {
  const { phone, amount } = req.body;

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, -3);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");

  try {
    const token = await getToken();

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: 174379,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: MPESA_CALLBACK_URL,
        AccountReference: "TableBank",
        TransactionDesc: "Test Contribution",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error("STK Push Error Response:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("STK Push Error:", error.message);
    }

    res.status(500).json({ error: error.response?.data || error.message });
  }
});

module.exports = router;
