# User Onboarding
Based on the jurisdiction, Fuze requires varying levels of User KYC data in order to create an account. This entire process can be performed via APIs.

## User Consent
As a partner, you will have to ensure that the User is shown T&Cs, that include consent to transfer KYC data to Fuze. The User must agree to this on your app or website, before any data is transferred to Fuze via APIs.

## Create User on Fuze
Once consent has been taken, you can now create a User on Fuze. Every request will consist the following sets data:

- `orgUserId`: All transactions on Fuze are associated with an orgUserId. This can be any string that uniquely identifies your Users within your systems. Ideally this is a UUID, with no PII. A ledger for every `orgUserId` is maintained by Fuze, and the balances can be queried at any point.
- `kyc` and `tnc`: `true` indicate that you have verified the User’s KYC information, and that the User has agreed to T&Cs (consent to transfer data to Fuze).
- `kycData`: This will be all the KYC data fields of a User. Keep in mind that the list given in the example below is exhaustive. Actual KYC data differs from case to case, and will be based on mutual agreement with Compliance Teams.

A sample request to create a user is as follows:

```bash
POST https://staging.api.fuze.finance/api/v1/user/create HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Content-Length: 75

{
    "orgUserId": "barbara_allen_2",
    "userType": "CONSUMER",
    "kyc": true,
    "tnc": true,
    "kycData": {
        "fullName": "John Doe",
        "gender": "male",
        "dob": "1990-01-15",
        "placeOfBirth": "Cityville",
        "nationality": "CountryA",
        "idType": "passport",
        "idNumber": "AB123456",
        "idExpiry": "2025-01-15",
        "addressLine1": "123 Main Street",
        "addressLine2": "Apt 456",
        "city": "Metropolis",
        "state": "Stateville",
        "country": "CountryA",
        "postalCode": "12345",
        "email": "john.doe@example.com",
        "mobile": "1234567890",
        "landline": "9876543210",
        "employmentStatus": "Employed",
        "employerDetails": {
            "employerName": "ABC Corporation",
            "employerAddress": "456 Business Avenue"
        },
        "politicalExposure": {
            "isPEP": true,
            "positionHeld": "PositionA",
            "relatedToPEP": {
                "isRelated": true,
                "pepName": "PEPName",
                "relationship": "Relative"
            }
        },
        "fatcaCrs": {
            "usPassport": true,
            "taxResidence": [
                "CountryA",
                "CountryB"
            ],
            "tinDetails": "123456789",
            "noTinReason": "",
            "spentMoreThan90Days": true,
            "undocumentedAccount": false
        },
        "internalAssessments": {
            "customerRiskScore": "High",
            "classification": "ClassA"
        },
        "screeningOutcomes": {
            "details": "Screening Passed"
        },
        "enhancedDueDiligence": {
            "isEDDCarriedOut": true,
            "details": "EDD Details"
        },
        "taxIdNumber": {
            "w9": "W912345",
            "ssnOrEIN": "123-45-6789"
        }
    }
}
```

In case any of the required fields are absent, Fuze will respond indicating exactly which fields are missing. As mentioned above, whether a given field is mandatory or not will change based on the jurisdiction, and mutual agreement with the compliance teams.

```json
{
    "code": 400,
    "data": null,
    "error": "[{\"instancePath\":\"\",\"schemaPath\":\"#/required\",\"keyword\":\"required\",\"params\":{\"missingProperty\":\"idExpiry\"},\"message\":\"must have required property 'idExpiry'\"},{\"instancePath\":\"\",\"schemaPath\":\"#/required\",\"keyword\":\"required\",\"params\":{\"missingProperty\":\"addressLine1\"},\"message\":\"must have required property 'addressLine1'\"},{\"instancePath\":\"\",\"schemaPath\":\"#/required\",\"keyword\":\"required\",\"params\":{\"missingProperty\":\"postalCode\"},\"message\":\"must have required property 'postalCode'\"},{\"instancePath\":\"\",\"schemaPath\":\"#/required\",\"keyword\":\"required\",\"params\":{\"missingProperty\":\"email\"},\"message\":\"must have required property 'email'\"},{\"instancePath\":\"\",\"schemaPath\":\"#/required\",\"keyword\":\"required\",\"params\":{\"missingProperty\":\"mobile\"},\"message\":\"must have required property 'mobile'\"}]"
}
```

If all the required fields are present, Fuze will respond showing that the User has been created, and that the User is in `PENDING` state. `PENDING` indicates that there KYC documents that Fuze should be sent, which we will cover next.

```json
{
    "code": 200,
    "data": {
        "orgUserId": "barbara_allen_2",
        "orgId": 10,
        "tnc": true,
        "kyc": true,
        "userType": "CONSUMER",
        "userStatus": "PENDING"
    },
    "error": null
}
```

## KYC Document Transfer
You can now transfer the documents to Fuze. Usually, this would mean a copy of the National ID or a Passport. Other documents can include liveliness check proofs and more. The exact documents required will be configured based on agreement between compliance teams.

To upload a document, you will need to generate an upload link. This is presigned link to object storage to which you can upload your file.

```bash
POST https://staging.api.fuze.finance/api/v1/kyc/individual/get-upload-link HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Content-Length: 75

{
    "orgUserId": "barbara_allen_2",
    "fileName": "barbara_allen_2_passport.pdf",
    "docCategory": "IDENTITY",
    "docSubCategory": "PASSPORT",
    "docdescription": "Passport for barbara_allen_2"
}
```

A valid response will contain a `url` to which you can upload the file:

```json
{
    "code": 200,
    "data": {
        "url": "https://bucket.s3.me-central-1.amazonaws.com/orgId-10/orgUserId-barbara_allen_2/docCategory-IDENTITY/docSubCategory-PASSPORT/1708196749729-barbara_allen_2_passport.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASE3L3K2E3BZUP2UM%2F20240217%2Fme-central-1%2Fs3%2Faws4_request&X-Amz-Date=20240217T190549Z&X-Amz-Expires=900&X-Amz-Signature=3a2a201a63c513ab74e54387afeda2a85ea51b87ecf02731ef5e6c07a3725182&X-Amz-SignedHeaders=host%3Bx-amz-acl%3Bx-amz-meta-doccategory%3Bx-amz-meta-docdescription%3Bx-amz-meta-docsubcategory%3Bx-amz-meta-filename%3Bx-amz-meta-orgid%3Bx-amz-meta-orguserid&x-amz-acl=private&x-amz-meta-doccategory=IDENTITY&x-amz-meta-docdescription=&x-amz-meta-docsubcategory=PASSPORT&x-amz-meta-filename=barbara_allen_2_passport.pdf&x-amz-meta-orgid=10&x-amz-meta-orguserid=barbara_allen_2"
    },
    "error": null
}
```

You can upload the file to this `url` using a file uploader of your choice or using `curl` as follows:

```
$ curl -X PUT -F "file=@mydocument.pdf" $URL
```

### EDD Documents
In case a particular customer is categorized as high risk, we expect additional documents to be uploaded and EDD conducted. The process is similar to the above, with the only difference being the `docCategory` and `docSubCategory` fields.

For example if there are two documents for EDD - a bank statement and a utility bill, then you would need to call the `get-upload-link` API twice, once for each document.

```bash
POST https://staging.api.fuze.finance/api/v1/kyc/individual/get-upload-link HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Content-Length: 75

{
    "orgUserId": "barbara_allen_2",
    "fileName": "barbara_allen_2_bank_statement.pdf",
    "docCategory": "EDD",
    "docSubCategory": "Bank_Statement",
    "docdescription": "Bank Statement for barbara_allen_2"
}
```

```bash
POST https://staging.api.fuze.finance/api/v1/kyc/individual/get-upload-link HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Content-Length: 75

{
    "orgUserId": "barbara_allen_2",
    "fileName": "barbara_allen_2_utlity_statement.pdf",
    "docCategory": "EDD",
    "docSubCategory": "Utility_Statement",
    "docdescription": "Utility Statement for barbara_allen_2"
}
```


Once both documents have been uploaded, you will have to inform Fuze that the EDD process is complete. This can be done by calling the `update-kyc-status` API.

```bash
POST https://staging.api.fuze.finance/api/v1/kyc/edd/update HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Content-Length: 75

{
    "orgUserId": "barbara_allen_2",
    "status": "COMPLETED"
}
```

And this would finish the EDD process for the User.

## User Active Callback
Once all files are uploaded, you will receive a webhook indicating that the status of the User has changed to `ACTIVE`.

```json
{
  "event": {
    "orgId": 10,
    "entity": "Users",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "orgUserId": "barbara_allen",
    "orgId": 10,
    "kyc": true,
    "tnc": true,
    "userStatus": "ACTIVE",
    "userType": "CONSUMER"
  }
}
```

Separately, you can also query the `getUser` API, which will give you the current status of the User.

```bash
POST https://staging.api.fuze.finance/api/v1/user/ HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Content-Length: 75

{
    "orgUserId": "barbara_allen_2"
}
```

```json
{
    "code":200,
    "data":{
        "id": 314,
        "orgUserId": "barbara_allen_2",
        "orgId":10,
        "kyc":true,
        "tnc":true,
        "userStatus":"PENDING",
        "userType":"CONSUMER",
        "createdAt":"2023-05-14T06:58:17.714Z",
        "updatedAt":"2023-08-14T05:28:18.738Z"
    },
    "error":null
}
```

In case the User is in `PENDING` state, the response will also list the documents that are yet to be transferred to Fuze.

