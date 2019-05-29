const mqtt = require('mqtt');
const { broker } = require('../config');

const client = mqtt.connect(broker);

let intervalId;

exports.connect = () => {
  client.on('connect', () => {
    client.subscribe('mytopic', { qos: 0 });
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
    humidity: Math.floor(Math.random() * 100)
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
    if (topic === 'mytopic') {
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
  client.publish('mytopic', message);
};
