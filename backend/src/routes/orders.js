const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { pool } = require("../db");
const crypto = require("crypto");

// Generate order ID: order_ + 16 alphanumeric characters
const generateOrderId = () => {
  return "order_" + crypto.randomBytes(8).toString("hex");
};

// CREATE ORDER API
router.post("/api/v1/orders", authMiddleware, async (req, res) => {
  const { amount, currency = "INR", receipt = null, notes = null } = req.body;

  // Validation
  if (!amount || amount < 100) {
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST_ERROR",
        description: "amount must be at least 100"
      }
    });
  }

  const orderId = generateOrderId();

  const insertQuery = `
    INSERT INTO orders (
      id, merchant_id, amount, currency, receipt, notes, status,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'created',
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  await pool.query(insertQuery, [
    orderId,
    req.merchant.id,
    amount,
    currency,
    receipt,
    notes
  ]);

  res.status(201).json({
    id: orderId,
    merchant_id: req.merchant.id,
    amount,
    currency,
    receipt,
    notes,
    status: "created",
    created_at: new Date().toISOString()
  });
});

router.get("/api/v1/orders/:order_id", authMiddleware, async (req, res) => {
  const { order_id } = req.params;

  const query = `
    SELECT *
    FROM orders
    WHERE id = $1 AND merchant_id = $2
  `;

  const result = await pool.query(query, [
    order_id,
    req.merchant.id
  ]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND_ERROR",
        description: "Order not found"
      }
    });
  }

  const order = result.rows[0];

  res.status(200).json({
    id: order.id,
    merchant_id: order.merchant_id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    notes: order.notes || {},
    status: order.status,
    created_at: order.created_at,
    updated_at: order.updated_at
  });
});


// PUBLIC ORDER FETCH (NO AUTH – for checkout page)
router.get("/api/v1/orders/:order_id/public", async (req, res) => {
  const { order_id } = req.params;

  const result = await pool.query(
    `SELECT id, amount, currency, status
     FROM orders
     WHERE id = $1`,
    [order_id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND_ERROR",
        description: "Order not found"
      }
    });
  }

  const order = result.rows[0];

  res.status(200).json({
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    status: order.status
  });
});

module.exports = router;
