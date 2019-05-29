const config = {
  broker: 'mqtt://localhost',
  mqttHost: 'mqtt.googleapis.com',
  mqttPort: 8883,
  algorithm: 'RS256',
  messageType: 'state',
  projectId: 'gcp-iot-app',
  regionId: 'us-central1',
  registryId: 'gcp-iot-registry',
  deviceId: 'fake'
};

module.exports = config;
