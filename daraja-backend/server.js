const express = require("express");
const cors = require("cors");
require("dotenv").config();

const stkRoutes = require("./index");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Mount the /stk-push route
app.use("/", stkRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
