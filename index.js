const { createPool } = require("mysql2");
const { v4 } = require("uuid");
require("dotenv").config();
const questionsData = require("./data-questions");

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

main();

async function main() {
  // await insertCountries();
  // await insertLanguages();
  await clearDatabase();
  await insertPatientsAndAddresses();
  await insertOrdersAndPrescriptions();
  await mapAnswers();
  //await updateExpiredOrders();
}

async function clearDatabase() {
  await localPool.query("DELETE FROM prescriptions");
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
      oldId,
    };

    addresses.push({ ...addressData });
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
      oldId,
    };

    patients.push({ ...patientData, addressData });
    delete patientData.oldId;
    patientsValues.push(Object.values(patientData));
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
    localPool.query(insertAdressesQuery, [addressesValues]),
  ]);

  console.log("PATIENTS AND ADDRESSES INSERTED");
}

async function insertOrdersAndPrescriptions() {
  const [qaOrders] = await qaPool.query(`
    SELECT 
      o.id, 0 as order_type, o.order_type as subscription_type,
      o.order_number, 0.skipVerification, o.reminder,
      o.is_nmi, o.is_ehr, 
      null as document_url,
      o.created_at, o.created_at as updated_at, 
      o.platform_order_id, 
      IF(o.financial_status = "authorized", 1, 
        IF(o.financial_status = "paid", 3, 
          IF (o.financial_status = "partially_refunded", 2, 4)
        )
      ) as status_code,
      IF(o.status IN (1, 3), 2, 
        IF (o.status = 0, 1, 
            IF (o.status = 4 AND o.prescription_status = 'pending', 1, 2 )
        )
      ) as questionnaire_status_code,
      a.answers_json, a.filled_at,
      o.commentClinician as doctor_comments,
      0 as is_blocking, o.is_sync_review, o.ehr_pdf,
      o.verification_hellosing as hellosign_reques_code,
      o.signing_url as hellosign_signing_url,
      IF(o.fulfillment_status = 'fulfilled', 1, 0) as hellosign_is_completed,
      o.files_url as hellosign_file_url,
      0 as has_answers, o.signed_at,
      o.created_at, o.created_at  as updated_at,
      o.variant as variant_id, o.clinicianId as doctor_id, 
      IF (p.hasQuestionnaire is null or p.hasQuestionnaire is false, 5, 
        IF (o.prescription_status in ('accepted', 'approved'), 2, 
          IF (o.prescription_status in ('denied', 'rejected', 'voided'), 3, 
            IF (o.prescription_status = 'pending', 1, 6)
          )
        )  
      ) as prescription_status_code,
      IF (o.is_woocommerce, 'woocommerce', 'shopify') as source
    FROM orders o 
    LEFT JOIN (
      SELECT order_id, answers_json, MAX(order_id), filled_at 
      FROM answers
      WHERE a.answers_json LIKE '%userDocument%' 
      OR a.answers_json LIKE '%faceImage%'
      GROUP BY order_id
    ) a
    ON a.order_id  = o.platform_order_id
    LEFT JOIN products p 
    ON p.id = o.product 
    WHERE o.status NOT IN (10, 12)
    AND (
      o.clinicianId NOT IN ("6e4f37a7-8c1a-429c-9750-430efbad49bc", "855e577c-90fc-4033-b54b-53a34b9fb65e", "")
      OR o.clinicianId IS NULL
    )
  `);

  const [localProductVariants] = await localPool.query(
    `SELECT * FROM products_variants`
  );

  const orders = [];
  const prescriptions = [];

  for (const item of qaOrders) {
    const patient = patients.find((e) => e.email === e.email);

    const order = {
      id: v4(),
      order_type: item.order_type,
      subscription_type: item.subscription_type,
      order_number: item.order_number,
      skipVerification: item.skipVerification,
      reminder: item.reminder,
      is_nmi: item.is_nmi,
      is_ehr: item.is_ehr,
      document_url: item.document_url,
      created_at: new Date(item.created_at),
      updated_at: new Date(item.updated_at),
      platform_order_id: item.platform_order_id,
      status_code: item.status_code,
      questionnaire_status_code: item.questionnaire_status_code,
      answers_json: item.answers_json,
      filled_at: item.filled_at,
      source: item.source,
    };

    order.patient_id = patient.id;
    order.shipping_address_id = patient.addressData.id;
    order.billing_address_id = patient.addressData.id;

    if (item.filled_at) {
      order.filled_at = new Date(item.filled_at);
    }

    if (item.answers_json) {
      const { results } = item.answers_json;
      order.document_url =
        results.find(
          (e) =>
            e.question_id === "userDocument" || e.question_id === "faceImage"
        )?.value || null;
    }

    delete order.answers_json;
    orders.push(Object.values(order));

    const prescription = {
      id: v4(),
      doctor_comments: item.doctor_comments,
      is_blocking: item.is_blocking,
      is_sync_review: item.is_sync_review,
      ehr_pdf: item.ehr_pdf,
      hellosign_reques_code: item.hellosign_reques_code,
      hellosign_signing_url: item.hellosign_signing_url,
      hellosign_is_completed: item.hellosign_is_completed,
      hellosign_file_url: item.hellosign_file_url,
      has_answers: item.has_answers,
      signed_at: item.signed_at ? new Date(item.signed_at) : null,
      created_at: order.created_at,
      updated_at: order.updated_at,
      order_id: order.id,
      variant_id:
        localProductVariants.find((e) => e.sku == item.variant_id)?.id || null,
      doctor_id: item.doctor_id,
      status_code: item.prescription_status_code,
    };
    prescriptions.push(Object.values(prescription));
  }

  await localPool.query(
    `INSERT INTO orders (id, order_type, subscription_type, order_number, skip_verification, 
      reminder, is_nmi, is_ehr, document_url, created_at, updated_at, platform_order_id,  
      status_code, questionnaire_status_code, questionnaire_fullfiled_at, source, patient_id,
      shipping_address_id, billing_address_id
    ) VALUES ?`,
    [orders]
  );

  await localPool.query(
    `INSERT INTO prescriptions (id, doctor_comments, is_blocking, is_sync_review, ehr_pdf, 
      hellosign_request_code, hellosign_signing_url, hellosign_is_completed, hellosign_file_url, 
      has_answers, signed_at, created_at, updated_at, order_id, variant_id, doctor_id, status_code  
    ) VALUES ?`,
    [prescriptions]
  );
  console.log("ORDERS AND PRESCRIPTIONS INSERTED");
}

async function mapAnswers() {
  try {
    const [answers] = await qaPool.query(
      "SELECT p.email, ans.answers_json, ans.order_id, ans.created_at, ans.filled_at FROM answers AS ans LEFT JOIN patient AS p ON p.id = ans.client_id"
    );
    for (const answer of answers) {
      if (answer.order_id) {
        const [order] = await localPool.query(
          `SELECT id FROM orders AS o
       WHERE o.platform_order_id = '${answer.order_id}'`
        );
        if (order.length) {
          const [prescription] = await localPool.query(
            `SELECT * FROM prescriptions AS p WHERE p.order_id ='${order[0].id}'`
          );
          await localPool.query(`UPDATE prescriptions
            SET has_answers=1
            WHERE id='${prescription[0].id}';`
          )
          results = answer.answers_json.results;
          const excludedIds = [
            "birthDate",
            "userDocument",
            "faceImage",
            322,
            323,
            326,
            327,
            328,
            335,
            341,
            358,
            371,
            390,
            405,
            437,
            282,
          ];
          for (const result of results) {
            let question = null;
            if (!excludedIds.includes(result.question_id) && result.value) {
              const data = questionsData.find((question) =>
                question.oldIds.includes(result.question_id)
              );
              if (data) {
                question = await localPool.query(
                  `SELECT * FROM questions AS q WHERE q.code = ${data.code}`
                );
              } else {
                question = await localPool.query(
                  `SELECT * FROM questions AS q WHERE q.code = 100${result.question_id}`
                );
                if (!question[0].length) {
                  const normalizedQuestion = result.question.replace(/'/g, '"');
                  await localPool.query(
                    `INSERT INTO questions (id,question, code, question_type_id) VALUES('${v4()}','${normalizedQuestion}', 100${
                      result.question_id
                    }, '8630d110-23fd-4065-98bf-196874ef7701')`
                  );
                  question = await localPool.query(
                    `SELECT * FROM questions AS q WHERE q.code = 100${result.question_id}`
                  );
                }
              }
              await localPool.query(
                `INSERT INTO answers (id, response, sort, created_at, updated_at, prescription_id, question_id)
              VALUES (?,?,?,?,?,?,?)`,
                [
                  v4(),
                  result.value,
                  100,
                  new Date(answer.created_at),
                  new Date(answer.filled_at || answer.created_at),
                  prescription[0].id,
                  question[0][0].id,
                ]
              );
            }
          }
        }
      }
    }
    console.log("Answers Done");
  } catch (e) {
    console.log(e);
  }
}

async function updateExpiredOrders() {
  await localPool.query(`
    UPDATE orders o 
    SET o.status_code = 5
    WHERE o.status_code = 1
    AND  DATEDIFF(now(), o.created_at) >= 30`
  );
  console.log("Orders Updated");
}