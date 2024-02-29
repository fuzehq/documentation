# Walkthrough: Payment APIs
Fuze’s Pay API offers you a simple and straightforward to send and receive payments. While the APIs cover multiple workflows, this walkthrough will cover the basics: adding a counterparty, and requesting funds from them.

### Add a counterparty
You can add a counterparty via the add counterparty endpoint. You will need to pass a `name`, `email` and unique `counterpartyId` which we call `orgUserId` of your choice. This id will be used to identify the counterparty in all future transactions.

In the example request below, we’ve passed the `orgUserId` `barbara_allen_2`

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
Connection: keep-alive
Content-Length: 100

{
    "orgUserId": "barbara_allen_2",
    "userType": "CONSUMER",
    "kyc": true,
    "tnc": true
    "kycData": {
        "emailId": "barbara_allen_2@yahoo.com",
        "country": "JP"
    },
}
```

A successful response will look as follows:
```json

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

A `PENDING` status means that the user’s KYC is in progress. `ACTIVE` means that the user’s KYC is completed.

In case the user already exists on Fuze, you will receive a `ACTIVE` status. Else, you will receive a webhook when the status moves from `PENDING`.

### Check Balance
You can also check balances your account, using the endpoint below.

```bash
POST https://staging.api.fuze.finance/api/v1/org/balance/ HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
```

Since this is a account that was just created, there are currently no balances against this account.

```json
{
    "code": 200,
    "data": {
        "balance": []
    },
    "error": null
}
```

### Create an invoice
Once a counterparty is created, you can request funds by using the following request:

- `orgUserId`: The counterparty.
- `quantity`: The amount of the invoice.
- `symbol`: The currency to request
- `notes`: Transaction notes.
- `clientOrderId`: Optional idempotency key which ensures the same order is not placed twice.

The response of the transaction will be `OPEN` - indicating the the request have been received successfully. You will also receive a `id` and a payment link.

```bash
POST https://staging.api.fuze.finance/api/v1/payment/invoice/ HTTP/1.1
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
    "quantity": 0.01,
    "symbol": "USDC",
    "notes": "Transaction request for payment",
    "clientOrderId": '5468bbb7-5e5f-425c-a6eb-b89e19a0298a',
}
```

A successful response will contain an `id` which can be used to query the status of the order later.

```json
{
    "code": 200,
    "data": {
        "id": 107,
        "orgId": 28,
        "orgUserId": "barbara_allen_2",
        "symbol": "USDC",
        "quantity": 1000,
        "status": "OPEN"
    },
    "error": null
}
```

You can set up a web hook that will notify you whether the transaction was successful. We’ve covered more details about our web hooks [here](/advanced/webhooks).

### Status of Invoice
To check the status of the order, using REST, use the `id` obtained while creating the order:

```bash
GET https://staging.api.fuze.finance/api/v1/payment/invoice/107 HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
```

```json
{
    "code": 200,
    "data": {
        "id": 107,
        "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a",
        "orgId": 28,
        "orgUserId": "barbara_allen_2",
        "symbol": "USDC",
        "quantity": 1000,
        "filled": 0,
        "status": "OPEN",
        "createdAt": "2023-06-08T07:53:11.688Z",
        "updatedAt": "2023-06-08T07:53:12.658Z"
    },
    "error": null
}
```

### Check Balance
You can also check balances your account, using the endpoint below.

```bash
POST https://staging.api.fuze.finance/api/v1/org/balance/ HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
```

Since this is a account that was just created, there are currently no balances against this account.

```json
{
    "code": 200,
    "data": {
        "balance": []
    },
    "error": null
}
```
