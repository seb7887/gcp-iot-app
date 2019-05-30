# Commands to Execute

```bash
node cloudiot_mqtt_example_nodejs.js mqttDeviceDemo --projectId=gcp-iot-app --cloudRegion=us-central1 --registryId=gcp-iot-registry --deviceId=fake --privateKeyFile=rsa_private.pem --algorithm=RS256
```

## To test

```bash
gcloud pubsub subscriptions pull --auto-ack projects/gcp-iot-app/subscriptions/telemetry-subscription
```
