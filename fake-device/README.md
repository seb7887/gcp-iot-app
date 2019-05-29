# Fake Device for Google Cloud IoT Core

Once a device registry is created, generate public and private certificates

```
openssl req -x509 -newkey rsa:2048 -keyout rsa_private.pem -nodes -out rsa_cert.pem -subj "/CN=unused"
```

And

```bash
gcloud iot devices create DEVICE_ID \
    --project=PROJECT_ID \
    --region=REGION \
    --registry=REGISTRY_ID \
    --public-key path=rsa_cert.pem,type=rsa-x509-pem
```
