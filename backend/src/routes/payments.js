// const express = require("express");
// const router = express.Router();
// const authMiddleware = require("../middleware/auth");
// const { pool } = require("../db");
// const crypto = require("crypto");
// const { isValidVPA } = require("../utils/vpaValidator");

// // Generate payment ID: pay_ + 16 chars
// const generatePaymentId = () => {
//   return "pay_" + crypto.randomBytes(8).toString("hex");
// };

// // // CREATE PAYMENT
// // router.post("/api/v1/payments", authMiddleware, async (req, res) => {
// //   const { order_id, method } = req.body;

// //   // Basic validation
// //   if (!order_id || !method) {
// //     return res.status(400).json({
// //       error: {
// //         code: "BAD_REQUEST_ERROR",
// //         description: "order_id and method are required"
// //       }
// //     });
// //   }

// //   // Fetch order & verify merchant
// //   const orderQuery = `
// //     SELECT * FROM orders
// //     WHERE id = $1 AND merchant_id = $2
// //   `;

// //   const orderResult = await pool.query(orderQuery, [
// //     order_id,
// //     req.merchant.id
// //   ]);

// //   if (orderResult.rows.length === 0) {
// //     return res.status(404).json({
// //       error: {
// //         code: "NOT_FOUND_ERROR",
// //         description: "Order not found"
// //       }
// //     });
// //   }

// //   const order = orderResult.rows[0];

// //   const paymentId = generatePaymentId();

// //   // Insert payment with status = processing
// //   const insertPaymentQuery = `
// //     INSERT INTO payments (
// //       id, order_id, merchant_id, amount, currency,
// //       method, status, created_at, updated_at
// //     )
// //     VALUES (
// //       $1, $2, $3, $4, $5,
// //       $6, 'processing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
// //     )
// //   `;

// //   await pool.query(insertPaymentQuery, [
// //     paymentId,
// //     order.id,
// //     req.merchant.id,
// //     order.amount,
// //     order.currency,
// //     method
// //   ]);

// //   res.status(201).json({
// //     id: paymentId,
// //     order_id: order.id,
// //     amount: order.amount,
// //     currency: order.currency,
// //     method,
// //     status: "processing",
// //     created_at: new Date().toISOString()
// //   });
// // });


// router.post("/api/v1/payments", authMiddleware, async (req, res) => {
//   const { order_id, method, vpa } = req.body;

//   if (!order_id || !method) {
//     return res.status(400).json({
//       error: {
//         code: "BAD_REQUEST_ERROR",
//         description: "order_id and method are required"
//       }
//     });
//   }

//   // Fetch order
//   const orderResult = await pool.query(
//     `SELECT * FROM orders WHERE id=$1 AND merchant_id=$2`,
//     [order_id, req.merchant.id]
//   );

//   if (orderResult.rows.length === 0) {
//     return res.status(404).json({
//       error: {
//         code: "NOT_FOUND_ERROR",
//         description: "Order not found"
//       }
//     });
//   }

//   const order = orderResult.rows[0];

//   // UPI validation
//   if (method === "upi") {
//     if (!vpa || !isValidVPA(vpa)) {
//       return res.status(400).json({
//         error: {
//           code: "INVALID_VPA",
//           description: "VPA format invalid"
//         }
//       });
//     }
//   }

//   const paymentId = generatePaymentId();

//   // Insert payment (processing)
//   await pool.query(
//     `INSERT INTO payments (
//       id, order_id, merchant_id, amount, currency,
//       method, vpa, status, created_at, updated_at
//     )
//     VALUES ($1,$2,$3,$4,$5,$6,$7,'processing',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
//     [
//       paymentId,
//       order.id,
//       req.merchant.id,
//       order.amount,
//       order.currency,
//       method,
//       vpa || null
//     ]
//   );

//   // ⏳ Simulate bank processing delay (5–10 sec)
//   const delay = Math.floor(Math.random() * 5000) + 5000;
//   await new Promise(resolve => setTimeout(resolve, delay));

//   // 🎯 Decide success (90% for UPI)
//   const success = Math.random() < 0.9;

//   if (success) {
//     await pool.query(
//       `UPDATE payments SET status='success', updated_at=CURRENT_TIMESTAMP WHERE id=$1`,
//       [paymentId]
//     );
//   } else {
//     await pool.query(
//       `UPDATE payments
//        SET status='failed',
//            error_code='PAYMENT_FAILED',
//            error_description='UPI payment failed',
//            updated_at=CURRENT_TIMESTAMP
//        WHERE id=$1`,
//       [paymentId]
//     );
//   }

//   res.status(201).json({
//     id: paymentId,
//     order_id: order.id,
//     amount: order.amount,
//     currency: order.currency,
//     method,
//     vpa,
//     status: success ? "success" : "failed",
//     created_at: new Date().toISOString()
//   });
// });


// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const authMiddleware = require("../middleware/auth");
// const { pool } = require("../db");
// const crypto = require("crypto");

// const { isValidVPA } = require("../utils/vpaValidator");
// const { isValidCardNumber } = require("../utils/luhn");
// const { detectCardNetwork } = require("../utils/cardNetwork");
// const { isValidExpiry } = require("../utils/expiryValidator");

// // Generate payment ID
// const generatePaymentId = () => {
//   return "pay_" + crypto.randomBytes(8).toString("hex");
// };

// const createPayment = async (req, res) => {
//   const { order_id, method, vpa, card } = req.body;

//   if (!order_id || !method) {
//     return res.status(400).json({
//       error: {
//         code: "BAD_REQUEST_ERROR",
//         description: "order_id and method are required"
//       }
//     });
//   }

//   const orderResult = await pool.query(
//     `SELECT * FROM orders WHERE id=$1 AND merchant_id=$2`,
//     [order_id, req.merchant.id]
//   );

//   if (orderResult.rows.length === 0) {
//     return res.status(404).json({
//       error: {
//         code: "NOT_FOUND_ERROR",
//         description: "Order not found"
//       }
//     });
//   }

//   const order = orderResult.rows[0];
//   const paymentId = generatePaymentId();

//   let cardNetwork = null;
//   let cardLast4 = null;

//   if (method === "upi") {
//     if (!vpa || !isValidVPA(vpa)) {
//       return res.status(400).json({
//         error: {
//           code: "INVALID_VPA",
//           description: "VPA format invalid"
//         }
//       });
//     }
//   }

//   if (method === "card") {
//     const { number, expiry_month, expiry_year } = card || {};

//     if (!isValidCardNumber(number)) {
//       return res.status(400).json({
//         error: {
//           code: "INVALID_CARD",
//           description: "Card number invalid"
//         }
//       });
//     }

//     if (!isValidExpiry(expiry_month, expiry_year)) {
//       return res.status(400).json({
//         error: {
//           code: "EXPIRED_CARD",
//           description: "Card expired"
//         }
//       });
//     }

//     cardNetwork = detectCardNetwork(number);
//     cardLast4 = number.slice(-4);
//   }

//   await pool.query(
//     `INSERT INTO payments (
//       id, order_id, merchant_id, amount, currency,
//       method, vpa, card_network, card_last4,
//       status, created_at, updated_at
//     )
//     VALUES (
//       $1,$2,$3,$4,$5,
//       $6,$7,$8,$9,
//       'processing',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
//     )`,
//     [
//       paymentId,
//       order.id,
//       req.merchant.id,
//       order.amount,
//       order.currency,
//       method,
//       vpa || null,
//       cardNetwork,
//       cardLast4
//     ]
//   );

//   const delay = Math.floor(Math.random() * 5000) + 5000;
//   await new Promise(r => setTimeout(r, delay));

//   const successRate = method === "upi" ? 0.9 : 0.95;
//   const success = Math.random() < successRate;

//   if (success) {
//     await pool.query(
//       `UPDATE payments SET status='success' WHERE id=$1`,
//       [paymentId]
//     );
//   } else {
//     await pool.query(
//       `UPDATE payments
//        SET status='failed',
//            error_code='PAYMENT_FAILED',
//            error_description='Payment failed'
//        WHERE id=$1`,
//       [paymentId]
//     );
//   }

//   return res.status(201).json({
//     id: paymentId,
//     order_id: order.id,
//     amount: order.amount,
//     currency: order.currency,
//     method,
//     ...(method === "upi" && { vpa }),
//     ...(method === "card" && {
//       card_network: cardNetwork,
//       card_last4: cardLast4
//     }),
//     status: success ? "success" : "failed",
//     created_at: new Date().toISOString()
//   });
// };


// router.post("/api/v1/payments", authMiddleware, async (req, res) => {
//   const { order_id, method, vpa, card } = req.body;

//   if (!order_id || !method) {
//     return res.status(400).json({
//       error: {
//         code: "BAD_REQUEST_ERROR",
//         description: "order_id and method are required"
//       }
//     });
//   }

//   // Fetch order
//   const orderResult = await pool.query(
//     `SELECT * FROM orders WHERE id=$1 AND merchant_id=$2`,
//     [order_id, req.merchant.id]
//   );

//   if (orderResult.rows.length === 0) {
//     return res.status(404).json({
//       error: {
//         code: "NOT_FOUND_ERROR",
//         description: "Order not found"
//       }
//     });
//   }

//   const order = orderResult.rows[0];
//   const paymentId = generatePaymentId();

//   let cardNetwork = null;
//   let cardLast4 = null;

//   // 🟢 UPI VALIDATION
//   if (method === "upi") {
//     if (!vpa || !isValidVPA(vpa)) {
//       return res.status(400).json({
//         error: {
//           code: "INVALID_VPA",
//           description: "VPA format invalid"
//         }
//       });
//     }
//   }

//   // 🟣 CARD VALIDATION
//   if (method === "card") {
//     if (
//       !card ||
//       !card.number ||
//       !card.expiry_month ||
//       !card.expiry_year ||
//       !card.cvv ||
//       !card.holder_name
//     ) {
//       return res.status(400).json({
//         error: {
//           code: "INVALID_CARD",
//           description: "Card details incomplete"
//         }
//       });
//     }

//     if (!isValidCardNumber(card.number)) {
//       return res.status(400).json({
//         error: {
//           code: "INVALID_CARD",
//           description: "Card number invalid"
//         }
//       });
//     }

//     if (!isValidExpiry(card.expiry_month, card.expiry_year)) {
//       return res.status(400).json({
//         error: {
//           code: "EXPIRED_CARD",
//           description: "Card expired"
//         }
//       });
//     }

//     cardNetwork = detectCardNetwork(card.number);
//     cardLast4 = card.number.slice(-4);
//   }

//   // Insert payment (processing)
//   await pool.query(
//     `INSERT INTO payments (
//       id, order_id, merchant_id, amount, currency,
//       method, vpa, card_network, card_last4,
//       status, created_at, updated_at
//     )
//     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'processing',
//             CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
//     [
//       paymentId,
//       order.id,
//       req.merchant.id,
//       order.amount,
//       order.currency,
//       method,
//       vpa || null,
//       cardNetwork,
//       cardLast4
//     ]
//   );

//   // ⏳ Simulated processing delay
//   const delay = Math.floor(Math.random() * 5000) + 5000;
//   await new Promise(resolve => setTimeout(resolve, delay));

//   const successRate = method === "upi" ? 0.9 : 0.95;
//   const success = Math.random() < successRate;

//   if (success) {
//     await pool.query(
//       `UPDATE payments SET status='success', updated_at=CURRENT_TIMESTAMP WHERE id=$1`,
//       [paymentId]
//     );
//   } else {
//     await pool.query(
//       `UPDATE payments
//        SET status='failed',
//            error_code='PAYMENT_FAILED',
//            error_description='Payment failed',
//            updated_at=CURRENT_TIMESTAMP
//        WHERE id=$1`,
//       [paymentId]
//     );
//   }

//   res.status(201).json({
//     id: paymentId,
//     order_id: order.id,
//     amount: order.amount,
//     currency: order.currency,
//     method,
//     ...(method === "upi" ? { vpa } : {}),
//     ...(method === "card" ? { card_network: cardNetwork, card_last4: cardLast4 } : {}),
//     status: success ? "success" : "failed",
//     created_at: new Date().toISOString()
//   });
// });

// // GET PAYMENT BY ID
// router.get("/api/v1/payments/:payment_id", authMiddleware, async (req, res) => {
//   const { payment_id } = req.params;

//   const result = await pool.query(
//     `SELECT *
//      FROM payments
//      WHERE id = $1 AND merchant_id = $2`,
//     [payment_id, req.merchant.id]
//   );

//   if (result.rows.length === 0) {
//     return res.status(404).json({
//       error: {
//         code: "NOT_FOUND_ERROR",
//         description: "Payment not found"
//       }
//     });
//   }

//   const payment = result.rows[0];

//   res.status(200).json({
//     id: payment.id,
//     order_id: payment.order_id,
//     amount: payment.amount,
//     currency: payment.currency,
//     method: payment.method,
//     ...(payment.method === "upi" && { vpa: payment.vpa }),
//     ...(payment.method === "card" && {
//       card_network: payment.card_network,
//       card_last4: payment.card_last4
//     }),
//     status: payment.status,
//     created_at: payment.created_at,
//     updated_at: payment.updated_at
//   });
// });

// // 🌍 PUBLIC: Create payment from checkout (NO AUTH)
// router.post("/api/v1/payments/public", async (req, res) => {
//   const { order_id, method, vpa, card } = req.body;

//   if (!order_id || !method) {
//     return res.status(400).json({
//       error: {
//         code: "BAD_REQUEST_ERROR",
//         description: "order_id and method are required"
//       }
//     });
//   }

//   // Fetch order
//   const orderResult = await pool.query(
//     `SELECT * FROM orders WHERE id=$1`,
//     [order_id]
//   );

//   if (orderResult.rows.length === 0) {
//     return res.status(404).json({
//       error: {
//         code: "NOT_FOUND_ERROR",
//         description: "Order not found"
//       }
//     });
//   }

//   // ⚠️ Fake merchant auth for reuse
//   req.merchant = { id: orderResult.rows[0].merchant_id };

//   // Forward to authenticated handler
//   req.url = "/api/v1/payments";
//   return router.handle(req, res);
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { pool } = require("../db");
const crypto = require("crypto");

const { isValidVPA } = require("../utils/vpaValidator");
const { isValidCardNumber } = require("../utils/luhn");
const { detectCardNetwork } = require("../utils/cardNetwork");
const { isValidExpiry } = require("../utils/expiryValidator");

// 🔑 Generate payment ID: pay_ + 16 alphanumeric characters
const generatePaymentId = () => {
  return "pay_" + crypto.randomBytes(8).toString("hex");
};

// ======================================================
// 🔧 SHARED PAYMENT LOGIC (USED BY AUTH + PUBLIC ROUTES)
// ======================================================
const createPayment = async (req, res) => {
  try {
    const { order_id, method, vpa, card } = req.body;

    if (!order_id || !method) {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST_ERROR",
          description: "order_id and method are required"
        }
      });
    }

    // 🔍 Fetch order & verify merchant
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id=$1 AND merchant_id=$2`,
      [order_id, req.merchant.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Order not found"
        }
      });
    }

    const order = orderResult.rows[0];
    const paymentId = generatePaymentId();

    let cardNetwork = null;
    let cardLast4 = null;

    // 🟢 UPI VALIDATION
    if (method === "upi") {
      if (!vpa || !isValidVPA(vpa)) {
        return res.status(400).json({
          error: {
            code: "INVALID_VPA",
            description: "VPA format invalid"
          }
        });
      }
    }

    // 🟣 CARD VALIDATION
    if (method === "card") {
      if (!card) {
        return res.status(400).json({
          error: {
            code: "INVALID_CARD",
            description: "Card details required"
          }
        });
      }

      const { number, expiry_month, expiry_year } = card;

      if (!isValidCardNumber(number)) {
        return res.status(400).json({
          error: {
            code: "INVALID_CARD",
            description: "Card number invalid"
          }
        });
      }

      if (!isValidExpiry(expiry_month, expiry_year)) {
        return res.status(400).json({
          error: {
            code: "EXPIRED_CARD",
            description: "Card expired"
          }
        });
      }

      cardNetwork = detectCardNetwork(number);
      cardLast4 = number.slice(-4);
    }

    // 🧾 INSERT PAYMENT (STATUS = processing)
    await pool.query(
      `INSERT INTO payments (
        id, order_id, merchant_id, amount, currency,
        method, vpa, card_network, card_last4,
        status, created_at, updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,
        'processing',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
      )`,
      [
        paymentId,
        order.id,
        req.merchant.id,
        order.amount,
        order.currency,
        method,
        vpa || null,
        cardNetwork,
        cardLast4
      ]
    );

    // ⏳ Simulate bank processing delay (5–10 sec)
    const delay = Math.floor(Math.random() * 5000) + 5000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 🎯 Success rate
    const successRate = method === "upi" ? 0.9 : 0.95;
    const success = Math.random() < successRate;

    if (success) {
      await pool.query(
        `UPDATE payments SET status='success', updated_at=CURRENT_TIMESTAMP WHERE id=$1`,
        [paymentId]
      );
    } else {
      await pool.query(
        `UPDATE payments
         SET status='failed',
             error_code='PAYMENT_FAILED',
             error_description='Payment failed',
             updated_at=CURRENT_TIMESTAMP
         WHERE id=$1`,
        [paymentId]
      );
    }

    // ✅ FINAL RESPONSE
    return res.status(201).json({
      id: paymentId,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      method,
      ...(method === "upi" && { vpa }),
      ...(method === "card" && {
        card_network: cardNetwork,
        card_last4: cardLast4
      }),
      status: success ? "success" : "failed",
      created_at: new Date().toISOString()
    });

  } catch (err) {
    console.error("Payment error:", err);
    return res.status(500).json({
      error: {
        code: "PAYMENT_FAILED",
        description: "Payment processing failed"
      }
    });
  }
};

// ======================================================
// 🔐 AUTHENTICATED PAYMENT API (MERCHANT)
// ======================================================
router.post(
  "/api/v1/payments",
  authMiddleware,
  createPayment
);

// ======================================================
// 🌍 PUBLIC PAYMENT API (CHECKOUT PAGE)
// ======================================================
router.post("/api/v1/payments/public", async (req, res) => {
  const orderResult = await pool.query(
    `SELECT merchant_id FROM orders WHERE id=$1`,
    [req.body.order_id]
  );

  if (orderResult.rows.length === 0) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND_ERROR",
        description: "Order not found"
      }
    });
  }

  // Fake merchant auth for reuse
  req.merchant = { id: orderResult.rows[0].merchant_id };
  return createPayment(req, res);
});

// 🔓 PUBLIC PAYMENT STATUS (NO AUTH)
router.get("/api/v1/payments/:payment_id", async (req, res) => {
  const { payment_id } = req.params;

  const result = await pool.query(
    `SELECT id, order_id, amount, currency, method, vpa,
            card_network, card_last4, status,
            created_at, updated_at
     FROM payments
     WHERE id = $1`,
    [payment_id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND_ERROR",
        description: "Payment not found"
      }
    });
  }

  res.status(200).json(result.rows[0]);
});

module.exports = router;
