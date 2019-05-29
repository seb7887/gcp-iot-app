# Google Cloud IoT Core Example App

This example consists on a fake device, which emulates a simple weather station, that is connected to Google IoT Core by MQTT protocol

## Google Cloud IoT Core Setup

```bash
# Install beta components
gcloud components install beta
# Authenticate with Google Cloud
gcloud auth login
# Create cloud project - choose your unique project name
gcloud projects create MY_PROJECT_NAME
# Set current project
gcloud config set project MY_PROJECT_NAME
# Add permissions for IoT Core
gcloud projects add-iam-policy-binding MY_PROJECT_NAME --member=serviceAccount:cloud-iot@system.gserviceaccount.com --role=roles/pubsub.publisher
# Create PubSub topic for device data:
gcloud beta pubsub topics create telemetry-topic
# Create PubSub subscription for device data:
gcloud beta pubsub subscriptions create --topic telemetry-topic telemetry-subscription
# Create device registry:
gcloud beta iot registries create gcp-iot-registry --region us-central1 --state-pubsub-topic=telemetry-topic
```
