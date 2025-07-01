const express = require("express");
const cors = require("cors");
require("dotenv").config();

const stkRoutes = require("./index");

const app = express();
const PORT = process.env.PORT || 4000;

// Global error catcher
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// Debug: check if env variables are loaded
console.log("🔑 DARAJA_CONSUMER_KEY:", process.env.DARAJA_CONSUMER_KEY ? "✔ Loaded" : "❌ MISSING");

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use("/", stkRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
