const express = require("express");
const router = express.Router();
const { pool } = require("../db");

router.get("/api/v1/test/merchant", async (req, res) => {
  const query = `
    SELECT id, email, api_key
    FROM merchants
    WHERE email = $1
  `;

  const result = await pool.query(query, ["test@example.com"]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: "Test merchant not found"
    });
  }

  res.status(200).json({
    id: result.rows[0].id,
    email: result.rows[0].email,
    api_key: result.rows[0].api_key,
    seeded: true
  });
});

module.exports = router;
