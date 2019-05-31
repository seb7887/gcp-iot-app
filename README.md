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

## Virtual Device

Just run `npm start`

## Big Query

Big Query is Google's low-cost, fully manageable petabyte scalable data storage service. Big Query is a stand-alone, there is no infrastructure to manage and you do not need a database administrator as it scales with your data

### Steps

- You must associate Big Query with your Google Cloud Project
- Create a new dataset
- Create a table (native table)
- Create Schema

## Firebase Cloud Functions

To insert data in Big Query we will use Firebase Cloud Functions, that can be configured to execute based on many different triggers and events. One of these triggers are new data inserted in a Pub/Sub topic, so we will listen to our topic associated with out Device Registry and with each data that arrives we execute a function that store the data in Big Query and mantain the last device data in Firestore Database

- **IMPORTANT: You have to enable Firestore API in Firebase console (it will be enabled in Google Cloud API too)**

### Steps

- Run `sudo npm i -g firebase-tools`
- Run `firebase login`to authenticate Google and setup the command line tools
- Run `firebase init`to associate the local project with your Firebase Project
- Run the above code to set some environment variables

```
firebase functions:config:set
bigquery.datasetname="weather_station_iot"
bigquery.tablename="raw_data"
```

## Firestore Database
