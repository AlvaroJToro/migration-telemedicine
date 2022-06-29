const { createPool } = require("mysql2");
const { v4 } = require("uuid");
require("dotenv").config();
const questionsData = require("./data-questions");

const oldPool = createPool({
  host: process.env.QA_DATABASE_HOST,
  user: process.env.QA_DATABASE_USERNAME,
  database: process.env.QA_DATABASE_SCHEMA,
  password: process.env.QA_DATABASE_PASSWORD,
  waitForConnections: true,
}).promise();

const newPool = createPool({
  host: process.env.LOCAL_DATABASE_HOST,
  user: process.env.LOCAL_DATABASE_USERNAME,
  database: process.env.LOCAL_DATABASE_SCHEMA,
  password: process.env.LOCAL_DATABASE_PASSWORD,
  port: Number(process.env.LOCAL_DATABASE_PORT),
  waitForConnections: true,
}).promise();

const countries = [];
const languages = [];
const addresses = [];
const patients = [];

main();

async function main() {
  const [oldOrders] = await oldPool.query("SELECT * FROM orders");

  for (const oldOrder of oldOrders) {
    const [newOrder] = await newPool.query("SELECT * FROM orders where platform_order_id = ? and source = ?",[oldOrder.platform_order_id,'woocommerce'])
    if(newOrder.length){
      const [patient] = await newPool.query("select id from patients where email = ?",oldOrder.email)
      if (patient.length){
        await newPool.query("UPDATE orders SET patient_id= ? where id = ?", [patient[0].id, newOrder[0].id])
      }
    }
  }
}
