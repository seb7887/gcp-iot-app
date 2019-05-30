const config = {
  broker: 'mqtt://localhost',
  mqttHost: 'mqtt.googleapis.com',
  mqttPort: 8883,
  algorithm: 'RS256',
  messageType: 'events',
  projectId: 'gcp-iot-app',
  regionId: 'us-central1',
  registryId: 'gcp-iot-registry',
  deviceId: 'fake',
  privateKeyFile: '../certs/rsa_private.pem',
  rootCertificateFile: '../certs/roots.pem'
};

module.exports = config;
