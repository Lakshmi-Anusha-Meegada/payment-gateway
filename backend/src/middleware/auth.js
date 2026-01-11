const { pool } = require("../db");

const authMiddleware = async (req, res, next) => {
  console.log("HEADERS RECEIVED:", req.headers);
  
  const apiKey = req.header("X-Api-Key");
  const apiSecret = req.header("X-Api-Secret");

  // If headers missing
  if (!apiKey || !apiSecret) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_ERROR",
        description: "Invalid API credentials"
      }
    });
  }

  // Check merchant in DB
  const query = `
    SELECT * FROM merchants
    WHERE api_key = $1 AND api_secret = $2 AND is_active = true
  `;

  const result = await pool.query(query, [apiKey, apiSecret]);

  // If merchant not found
  if (result.rows.length === 0) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_ERROR",
        description: "Invalid API credentials"
      }
    });
  }

  // Attach merchant to request
  req.merchant = result.rows[0];
  next();
};

module.exports = authMiddleware;
