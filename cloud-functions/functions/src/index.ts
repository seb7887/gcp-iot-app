import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { BigQuery } from '@google-cloud/bigquery';
// CORS settings
const cors = require('cors')({ origin: true });

const mqttTopic = 'telemetry-topic';

interface IMQTTData {
  humidity: number;
  temperature: number;
  deviceId: string;
  timestamp: string;
}

// Initializes Cloud Functions
admin.initializeApp(functions.config().firebase);

// BigQuery settings
const bigquery = new BigQuery();

// Firestore settings
const db = admin.firestore();

// Store all raw data into BigQuery
function insertIntoBigQuery(data: IMQTTData) {
  const dataset = bigquery.dataset(functions.config().bigquery.datasetname);
  const table = dataset.table(functions.config().bigquery.tablename);

  return table.insert(data);
}

// Maintain last status in firestore
function updateCurrentDataFirestore(data: IMQTTData) {
  const { humidity, temperature, timestamp, deviceId } = data;
  const dbRef = db.collection('devices').doc(deviceId);

  return dbRef.set(
    {
      humidity,
      temperature,
      lastTimestamp: timestamp
    },
    { merge: true }
  );
}

// Receive data from pubsub, then write telemetry raw data to bigquery
// Maintain last data on firestore database
exports.receiveTelemetry = functions.pubsub
  .topic(mqttTopic)
  .onPublish((message, context: functions.EventContext) => {
    const attributes = message.attributes;
    const payload = message.json;

    const deviceId: string = attributes['deviceId'];
    const { humidity, temperature } = payload;
    const { timestamp } = context;

    const data: IMQTTData = {
      humidity,
      temperature,
      deviceId,
      timestamp
    };

    if (
      humidity < 0 ||
      humidity > 100 ||
      temperature < -50 ||
      temperature > 100
    ) {
      // Validate and do nothing
      return;
    }

    return Promise.all([
      insertIntoBigQuery(data),
      updateCurrentDataFirestore(data)
    ]);
  });

// Detects a Firestore DB change and do something
exports.dbUpdate = functions.firestore
  // assumes a document whose ID is the same as the deviceId
  .document(`/devices/fake`)
  .onWrite(
    async (
      change: functions.Change<admin.firestore.DocumentSnapshot>,
      context?: functions.EventContext
    ) => {
      if (context) {
        console.log(context);
        console.log('Firestore DB -> Change!');
      } else {
        throw Error('no context from trigger');
      }
    }
  );

// Query bigquery with the last 7 days of data
// HTTP endpoint to be used by the webapp
exports.getReportData = functions.https.onRequest((req, res) => {
  const projectId = 'gcp-iot-app';
  const datasetName = functions.config().bigquery.datasetname;
  const tableName = functions.config().bigquery.tablename;
  const table = `${projectId}.${datasetName}.${tableName}`;

  const query = `
    SELECT * FROM \`${table}\` LIMIT 1000
  `;

  return bigquery
    .query({
      query: query,
      useLegacySql: false
    })
    .then(result => {
      console.log(result);
      const rows = result[0];

      cors(req, res, () => {
        res.status(200).json(rows);
      });
    });
});
