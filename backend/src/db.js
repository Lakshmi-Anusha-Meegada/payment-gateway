const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "gateway_user",
  password: "gateway_pass",
  database: "payment_gateway",
});


const checkDB = async () => {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch (err) {
    return false;
  }
};

const runSchema = async () => {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSQL = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schemaSQL);
};

module.exports = {
  pool,
  checkDB,
  runSchema
};
