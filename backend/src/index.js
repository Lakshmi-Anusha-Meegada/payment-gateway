const express = require("express");
const dotenv = require("dotenv");
const { runSchema } = require("./db");
const { seedTestMerchant } = require("./seed");
const testRoutes = require("./routes/test");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");
const cors = require("cors");

dotenv.config({ path: "../.env" });

const app = express();

app.use(cors());

app.use(express.json());

app.use(paymentRoutes);

app.use(orderRoutes);

app.use(testRoutes);

const healthRoute = require("./routes/health");
app.use("/health", healthRoute);


const PORT = process.env.PORT || 8000;

runSchema()
  .then(seedTestMerchant)
  .then(() => {
    console.log("📦 Database ready");
    app.listen(8000, () => {
      console.log("✅ Server running on port 8000");
    });
  })
  .catch(err => {
    console.error("Startup error", err);
  });

