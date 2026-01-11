const { pool } = require("./db");

const seedTestMerchant = async () => {
  const merchantId = "550e8400-e29b-41d4-a716-446655440000";

  const checkQuery = `
    SELECT id FROM merchants WHERE email = $1
  `;

  const insertQuery = `
    INSERT INTO merchants (
      id, name, email, api_key, api_secret, created_at
    )
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
  `;

  const existing = await pool.query(checkQuery, ["test@example.com"]);

  if (existing.rows.length === 0) {
    await pool.query(insertQuery, [
      merchantId,
      "Test Merchant",
      "test@example.com",
      "key_test_abc123",
      "secret_test_xyz789"
    ]);

    console.log("🧪 Test merchant seeded");
  } else {
    console.log("🧪 Test merchant already exists");
  }
};

module.exports = { seedTestMerchant };
