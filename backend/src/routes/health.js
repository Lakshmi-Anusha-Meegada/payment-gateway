const express = require("express");
const router = express.Router();
const { checkDB } = require("../db");

router.get("/", async (req, res) => {
  const dbConnected = await checkDB();

  res.status(200).json({
    status: "healthy",
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
