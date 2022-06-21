const { createPool } = require("mysql2");
const { v4 } = require("uuid");
require('dotenv').config();

const qaPool = createPool({
  host: process.env.QA_DATABASE_HOST,
  user: process.env.QA_DATABASE_USERNAME,
  database: process.env.QA_DATABASE_SCHEMA,
  password: process.env.QA_DATABASE_PASSWORD,
  waitForConnections: true,
}).promise();

const localPool = createPool({
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
const orders = [];

main();

async function main() {
  // await insertCountries();
  // await insertLanguages();
  await clearDatabase();
  await insertPatientsAndAddresses();
  await insertOrders();
}

async function clearDatabase() {
  await localPool.query("DELETE FROM orders");
  await localPool.query("DELETE FROM patients");
  await localPool.query("DELETE FROM addresses");
}

async function insertCountries() {
  const [qaCountries] = await qaPool.query("SELECT * FROM countries");
  await localPool.query("DELETE FROM countries");

  const values = [
    qaCountries.map((e) => {
      const id = v4();
      countries.push({ id, ...e });
      return [id, ...Object.values(e)];
    }),
  ];

  await localPool.query(
    "INSERT INTO countries (id, code, name) VALUES ?",
    values
  );
  console.log("COUNTRIES INSERTED");
}

async function insertLanguages() {
  const [qaLanguages] = await qaPool.query("SELECT * FROM languages");
  await localPool.query("DELETE FROM languages");

  const values = [
    qaLanguages.map((e) => {
      const id = v4();
      languages.push({ id, ...e });
      return [id, ...Object.values(e)];
    }),
  ];

  await localPool.query(
    "INSERT INTO languages (id, code, name) VALUES ?",
    values
  );
  console.log("LANGUAGES INSERTED");
}

async function insertPatientsAndAddresses() {
  const [qaPatients] = await qaPool.query(`
    SELECT p.id, p.first_name, p.last_name, p.gender, p.cellphone, 
      p.email, p.address, p.state, p.zipcode, p.city,
      IF ( p.created_at IS NOT NULL,  p.created_at, NOW()) as created_at,
      IF ( p.created_at IS NOT NULL,  p.created_at, NOW()) as updated_at
    FROM patient p 
  `);

  const addressesValues = [];
  const patientsValues = [];

  for (const patient of qaPatients) {
    const createdAt = new Date(patient.created_at);
    const updatedAt = new Date(patient.updated_at);
    const oldId = patient.id;

    const addressData = {
      id: v4(),
      address: patient.address,
      state: patient.state,
      zipcode: patient.zipcode,
      city: patient.city,
      created_at: createdAt,
      updated_at: updatedAt,
      oldId
    }

    addresses.push({...addressData});
    delete addressData.oldId;
    addressesValues.push(Object.values(addressData));

    const patientData = {
      id: v4(),
      first_name: patient.first_name,
      last_name: patient.last_name,
      gender: patient.gender,
      cellphone: patient.cellphone,
      email: patient.email,
      created_at: createdAt,
      updated_at: updatedAt,
      oldId
    }

    patients.push({...patientData, addressData});
    delete patientData.oldId;
    patientsValues.push(Object.values(patientData))
  }

  const insertPatientsQuery = `
    INSERT INTO patients (id, first_name, last_name, gender, cellphone, email, created_at, updated_at) 
    VALUES ?
  `;

  const insertAdressesQuery = `
    INSERT INTO addresses (id, address, state, zipcode, city, created_at, updated_at) 
    VALUES ?
  `;

  await Promise.all([
    localPool.query(insertPatientsQuery, [patientsValues]),
    localPool.query(insertAdressesQuery, [addressesValues])
  ]);

  console.log("PATIENTS AND ADDRESSES INSERTED");
}

async function insertOrders() {
  const [qaOrders] = await qaPool.query(`
    SELECT 
      o.id, 0 as order_type, o.order_type as subscription_type,
      o.order_number, 0.skipVerification, o.reminder,
      o.is_nmi, o.is_ehr, 
      null as document_url,
      o.created_at, o.created_at as updated_at, 
      o.platform_order_id, 
      IF(o.status IN (0, 8), 1, o.status) as status_code,
      IF(o.status IN (4, 1), 2, 1) as questionnaire_status_code,
      a.answers_json, a.filled_at 
    FROM orders o 
    LEFT JOIN (
      SELECT order_id, answers_json, MAX(order_id), filled_at 
      FROM answers
      GROUP BY order_id
    ) a
    on a.order_id  = o.platform_order_id
    WHERE o.status NOT IN (10, 12)
  `);

  const values = [
    qaOrders.map((order) => {
      const id = v4();
      const patient = patients.find(e => e.email === e.email);

      order.created_at = new Date(order.created_at);
      order.updated_at = new Date(order.updated_at);
      order.patient_id = patient.id;
      order.shipping_address_id = patient.addressData.id;
      order.billing_address_id = patient.addressData.id;

      if (order.filled_at) {
        order.filled_at = new Date(order.filled_at);
      }

      if (order.answers_json) {
        const { results } = order.answers_json;
        order.document_url = results.find(e => e.question_id === "userDocument")?.value || null;
      }

      const oldId = order.id;
      delete order.id;
      delete order.answers_json;
      orders.push({ id, ...order, oldId });
      return [id, ...Object.values(order)];
    }),
  ];

  await localPool.query(
    `INSERT INTO orders (id, order_type, subscription_type, order_number, skip_verification, 
      reminder, is_nmi, is_ehr, document_url, created_at, updated_at, platform_order_id,  
      status_code, questionnaire_status_code, questionnaire_fullfiled_at, patient_id,
      shipping_address_id, billing_address_id
    ) VALUES ?`,
    values
  );
  console.log("ORDERS INSERTED");
}