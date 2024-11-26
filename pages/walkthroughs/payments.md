# Walkthrough: Payment APIs
Fuze’s Pay API offers you a simple and straightforward to send and receive payments. While the APIs cover multiple workflows, this walkthrough will cover the basics: adding a counterparty, and requesting funds from them.

### Add a Customer
You can add a customer via the endpoint. You will need to pass a `kycData`, and unique `clientIdentifier` which we call `orgUserId` of your choice. This id will be used to identify the counterparty in all future transactions.

KYC information is optional, and will be dependent on the gap analysis of our compliance team.

```bash
POST https://staging.api.fuze.finance/api/v1/payment/gateway/third-party/create/ HTTP/1.1
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
    "clientIdentifier": "barbara_allen_2",
    "kycData": {
        "name": "Barbara Allen",
        "emailId": "barbara_allen_2@yahoo.com",
        "address": {
            "line1": "123 Main St",
            "city": "San Francisco",
            "state": "CA",
            "country": "US",
            "zip": "94105"
        }
    },
}
```

A successful response will look as follows:
```json

    "code": 200,
    "data": "SUCCESS",
    "error": null
}
```

### Create a Payin
Once a counterparty is created, you can create a payment request using the `payment` endpoint. You will need to pass the
following parameters:

- `clientIdentifier`: The counterparty identifier you passed while creating the counterparty.
- `symbol`: The currency to request payment in.
- `quantity`: The amount of the payment.
- `chain`: The blockchain to use for the transaction.
- `network`: The network to use for the transaction.
- `clientOrderId`: Optional idempotency key which ensures the same order is not placed twice.

The response of the transaction will be `OPEN` - indicating the the request have been received successfully. You will also receive a `id` and a payment link.

```bash
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payin/create HTTP/1.1
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
    "clientIdentifier": "barbara_allen_2",
    "symbol": "USDC_USD",
    "chain": "ETHEREUM",
    "network": "MAINNET",
    "quantity": 1000,
    "clientOrderId": '5468bbb7-5e5f-425c-a6eb-b89e19a0298a',
}
```

A successful response will contain an `id` which can be used to query the status of the order later.

```json
{
    "code": 200,
    "data": {
        "id": 107,
        "clientIdentifier": "barbara_allen_2",
        "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a",
        "orgId": 28,
        "symbol": "USDC_USD",
        "quantity": 1000,
        "walletAddress": "0x8f8e8b3b8b1f3f1f3f1f3f1f3f1f3f1f3f1f3f1f",
        "chain": "ETHEREUM",
        "network": "MAINNET",
        "expiryTime": "2023-06-09T07:53:12.658Z",
        "status": "OPEN"
    },
    "error": null
}
```

You can set up a web hook that will notify you whether the transaction was successful. We’ve covered more details about our web hooks [here](/advanced/webhooks).

### Status of Payin
To check the status of the payment, using REST, use the `id` obtained while creating the order:

```bash
GET https://staging.api.fuze.finance/api/v1/payment/gateway/payin/status/107 HTTP/1.1
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
        "clientIdentifier": "barbara_allen_2",
        "symbol": "USDC",
        "quantity": 1000,
        "filled": 0,
        "status": "OPEN",
        "walletAddress": "0x8f8e8b3b8b1f3f1f3f1f3f1f3f1f3f1f3f1f3f1f",
        "chain": "ETHEREUM",
        "network": "MAINNET",
        "expiryTime": "2023-06-09T07:53:12.658Z",
        "createdAt": "2023-06-08T07:53:11.688Z",
        "updatedAt": "2023-06-08T07:53:12.658Z"
    },
    "error": null
}
```

### Create a Payout
Unlike a payin, a payout is a two step process. The first step is generating a quote for the payout, and the second step
is executing the payout.

For generating a quote, you can use the `payment` endpoint. You will need to pass the following parameters:
- `clientIdentifier`: The counterparty identifier you passed while creating the counterparty.
- `symbol`: The currency to request payment in.
- `quantity`: The amount of the payment.
- `clientOrderId`: Optional idempotency key which ensures the same order is not placed twice.

```bash
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payout/quote HTTP/1.1
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
    "clientIdentifier": "barbara_allen_2",
    "symbol": "USDC_USD",
    "quantity": 1000,
    "clientOrderId": '5468bbb7-5e5f-425c-a6eb-b89e19a0298a',
}
```

The response of the transaction will contain a `id` which is required for the next API call.

```json
{
  "code": 200,
  "data": {
    "id": 591,
    "orgId": 10,
    "orgUserId": "barbara_allen_2",
    "expiryTime": ...,
    "symbol": "BTC_USD",
    "operation": "BUY",
    "quantity": 0.01,
    "price": 26749.08
  },
  "error": null
}
```

If you are okay with the quote, you can execute the payout using the `payout` endpoint. You will need to pass the
following parameters:

- `clientIdentifier`: The counterparty identifier you passed while creating the counterparty.
- `quoteId`: The id of the quote you received in the previous step.
- `chain`: The blockchain to use for the transaction.
- `network`: The network to use for the transaction.
- `clientOrderId`: Optional idempotency key which ensures the same order is not placed twice.

The response of the transaction will be `OPEN` - indicating the the request have been received successfully. You will also receive a `id` and a payment link.

```bash
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payout/create HTTP/1.1
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
    "clientIdentifier": "barbara_allen_2",
    "symbol": "USDC_USD",
    "chain": "ETHEREUM",
    "network": "MAINNET",
    "quantity": 1000,
    "clientOrderId": '5468bbb7-5e5f-425c-a6eb-b89e19a0298a',
}
```

A successful response will contain an `id` which can be used to query the status of the order later.

```json
{
    "code": 200,
    "data": {
        "id": 107,
        "clientIdentifier": "barbara_allen_2",
        "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a",
        "orgId": 28,
        "symbol": "USDC_USD",
        "quantity": 1000,
        "walletAddress": "0x8f8e8b3b8b1f3f1f3f1f3f1f3f1f3f1f3f1f3f1f",
        "chain": "ETHEREUM",
        "network": "MAINNET",
        "expiryTime": "2023-06-09T07:53:12.658Z",
        "status": "OPEN"
    },
    "error": null
}
```

You can set up a web hook that will notify you whether the transaction was successful. We’ve covered more details about our web hooks [here](/advanced/webhooks).

### Status of Payout
To check the status of the payment, using REST, use the `id` obtained while creating the order:

```bash
GET https://staging.api.fuze.finance/api/v1/payment/gateway/payout/status/107 HTTP/1.1
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
        "clientIdentifier": "barbara_allen_2",
        "symbol": "USDC",
        "quantity": 1000,
        "filled": 0,
        "status": "OPEN",
        "walletAddress": "0x8f8e8b3b8b1f3f1f3f1f3f1f3f1f3f1f3f1f3f1f",
        "chain": "ETHEREUM",
        "network": "MAINNET",
        "expiryTime": "2023-06-09T07:53:12.658Z",
        "createdAt": "2023-06-08T07:53:11.688Z",
        "updatedAt": "2023-06-08T07:53:12.658Z"
    },
    "error": null
}
```
