const mqtt = require('mqtt');
const createJwt = require('../jwt');
const config = require('../config');
const { projectId, regionId, registryId, deviceId, messageType } = config;

const mqttClientId = `projects/${projectId}/locations/${regionId}/registries/${registryId}/devices/${deviceId}`;
const mqttTopic = `/devices/${deviceId}/${messageType}`;

const connectionsArgs = {
  host: config.mqttHost,
  port: config.mqttPort,
  clientId: mqttClientId,
  username: 'unused',
  password: createJwt(projectId, config.algorithm),
  protocol: 'mqtts',
  secureProtocol: 'TLSv1_2_method'
};

const client = mqtt.connect(connectionsArgs);

let intervalId;

exports.connect = () => {
  client.on('connect', () => {
    client.subscribe(mqttTopic, { qos: 0 });
    client.subscribe('configtopic', { qos: 1 });
    console.log('MQTT: Device Connected');
  });

  client.on('error', err => {
    console.log(err);
    client.end();
  });

  client.on('close', () => {
    console.log('MQTT: Device Disconnected');
  });
};

const getInfo = () => {
  return JSON.stringify({
    temperature: Math.floor(Math.random() * 35),
    humidity: Math.floor(Math.random() * 100),
    time: new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ')
  });
};

const startPublish = interval => {
  intervalId = setInterval(() => {
    const data = getInfo();
    client.publish('mytopic', data);
  }, interval);
};

exports.loop = () => {
  let delay = 2000;

  client.on('message', (topic, message) => {
    if (topic === mqttTopic) {
      console.log('Message: ' + message.toString());
    }
    if (topic === 'configtopic') {
      console.log('Delay Configuration: ' + message.toString());
      clearInterval(intervalId);
      delay = JSON.parse(message.toString()).delay;
      startPublish(delay);
    }
  });

  startPublish(delay);
};

exports.publishData = message => {
  client.publish(mqttTopic, message);
};
