# Walkthrough: Payment APIs

The Fuze Pay API allows merchants to seamlessly accept and disburse cryptocurrency payments while ensuring compliance through built-in KYC and AML checks. This document provides a comprehensive walkthrough of core API calls—customer management, deposit wallets, payins, payouts, and account management.

## API Environments

Fuze provides two primary environments for developers: **Staging** and **Production**. Each environment has its own base URL and purpose, ensuring you can safely test your integration before handling live transactions.

| **Environment** | **Base URL**               | **Purpose**                                                                                                                                                                           |
| --------------------- | -------------------------------- |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Staging**     | https://staging.api.fuze.finance | Used for **testing and development**. This environment often points to **test networks**(e.g., test blockchains) and allows you to validate integrations without real financial risk. |

## **Common API Headers**

The following headers are required across all API endpoints unless otherwise specified:

| **Header Name** | **Description**                                                   | Example              |
| --------------------- |-------------------------------------------------------------------|----------------------|
| X-SIGNATURE           | Digital signature used for request authentication.                | d0f8e2c8...          |
| X-TIMESTAMP           | Unix timestamp of the request to ensure the request is not stale. | 1687944000           |
| X-API-KEY             | Unique API key for authorization.                                 | api_key_example12345 |
| Content-Type          | Specifies the type of the content in the request body.            | application/json     |

This section applies globally to all APIs. Specific header usage will still be mentioned in individual API details if required.

## **Manage Customers**

You can add a customer via the endpoint. You will need to pass `kycData`, and a unique `clientIdentifier` This `clientIdentifier` will be used to identify the counterparty in all future transactions.

### Create Customer

Once you’ve uploaded the documents, you can create a customer using the following API

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/third-party/create/
```

**Body Parameters**

- `clientIdentifier` (string, required): The unique identifier for the customer. Example: `sherlockholmes`.
- `sumsubToken` (string, optional): In case we're using SumSub to share KYC information, you can pass this field.
- `kycData` (object, required): KYC details for the customer, including:
  - `fullName` (string, required): Customer's full name. Example: `sherlock holmes`.
  - `email` (string, required): Customer's email. Example: `sherlockholmes@baker.st`.
  - `entityType` (string, required): Type of entity. Example: `individual`.
  - `addressLine1` (string, required): Address line 1. Example: `221B`.
  - `addressLine2` (string, optional): Address line 2. Example: `Baker St`.
  - `city` (string, required): City. Example: `London`.
  - `state` (string, required): State. Example: `London`.
  - `country` (string, required): Country. Example: `GB`.
  - `postalCode` (string, required): Postal Code. Example: `NW16XE`.

**Sample Request**

```json
{  
  "clientIdentifier": "sherlockholmes",
  "email": "sherlockholmes@baker.st",
  "type": "THIRD_PARTY",
  "sumsubToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGllbnRfaWQiLCJleHAiOjE2ODAwMDAwMDAsImlhdCI6MTY4MDAwMDAwMCwiaXNzIjoic3Vtc3ViIn0.W6lTRbXMDmsoVqPyVduVn2Tr3EEdkgJEsnR69G1d9CQ",
  "kycData": {
	"fullName": "sherlock holmes",
	"entityType": "individual",
	"email": "sherlockholmes@baker.st",
	"addressLine1": "221B",
	"addressLine2": "Baker St",
	"city": "London",
	"state": "London",
	"country": "GB",
	"postalCode": "NW16XE"
  }
}
```

**Sample response**

```json
{
  "code": 200,
  "data": {
    "name": "sherlock holmes",
    "email": "sherlockholmes@baker.st",
    "uuid": "0120792e-323a-4e02-b951-1abbb44bf550",
    "type": "THIRD_PARTY",
    "status": "PENDING",
    "clientIdentifier": "sherlockholmes",
    "createdAt": "2025-01-14T09:44:13.246Z"
  },
  "error": null
}
```

Based on the customer lifecycle events you’ll receive the following webhooks.

**Account Approved**

After the account is approved, you can start creating payins and payouts.

```json
{
  "event": {
    "orgId": 10,
    "entity": "ThirdParties",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "uuid": "0120792e-323a-4e02-b951-1abbb44bf550",
    "status": "ACTIVE",
    "reason": null
  }
}
```

**Compliance Follow Up**

In case the Fuze compliance team needs further information/clarifications, you’ll receive this webhook. You’ll receive reasons for rejection along with the documents which had problems. To solve this, you need to resolve it with our compliance team offline.

```json
{
  "event": {
    "orgId": 10,
    "entity": "ThirdParties",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "uuid": "0120792e-323a-4e02-b951-1abbb44bf550",
    "status": "PENDING",
    "reason": "Further due diligence required" 
  }
}
```

**Account Rejected**

In case we can’t accept the customer due to our compliance guidelines, you’ll receive this error. No further action can be taken to approve this customer.

```json
{
  "event": {
    "orgId": 10,
    "entity": "ThirdParties",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "uuid": "0120792e-323a-4e02-b951-1abbb44bf550",
    "status": "FAILED",
    "reason": "Rejected due to compliance reasons."
  }
}
```

**Account Suspended**

No further action can be taken on the account. All customer details would be reported to relevant local authorities. Examples of this action include cases where the funds end up in a sanctioned entity, or if the wallet added for whitelisting was tied to terrorist financing or sanctioned entities.

```json
{
  "event": {
    "orgId": 10,
    "entity": "ThirdParties",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "uuid": "0120792e-323a-4e02-b951-1abbb44bf550",
    "status": "INACTIVE",
    "reason": "Rejected due to AML checks."
  }
}
```

### **Fetch a Customer**

You can retrieve customer details using the following API. This allows you to check the current status, KYC information, and associated documents of a specific customer.

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/third-party/
```

**Body Parameters**

- `clientIdentifier` (string, required) - The unique identifier of the customer you want to fetch. Example: `sherlockholmes`

**Successful Response**

```json
{
  "code": 200,
  "data": {
    "name": "sherlock holmes",
    "email": "sherlockholmes@baker.st",
    "uuid": "0120792e-323a-4e02-b951-1abbb44bf550",
    "type": "THIRD_PARTY",
    "status": "ACTIVE",
    "clientIdentifier": "sherlockholmes",
    "createdAt": "2025-01-22T04:32:46.242Z"
  },
  "error": null
}
```

**Error Example**

```json
{
    "code": 404,
    "data": null,
    "error": "Not Found"
}
```


### **Fetch all Customers**

You can retrieve customers list using the following API.

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/third-party/list
```

**Successful Response**

```json
{
  "code": 200,
  "data": [
    {
      "name": "sherlock holmes",
      "email": "sherlockholmes@baker.st",
      "uuid": "0120792e-323a-4e02-b951-1abbb44bf550",
      "type": "THIRD_PARTY",
      "status": "ACTIVE",
      "clientIdentifier": "sherlockholmes",
      "createdAt": "2025-01-14T09:52:06.203Z"
    },
    {
      "name": "dr watson",
      "email": "watson@baker.st",
      "uuid": "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae4",
      "type": "THIRD_PARTY",
      "status": "ACTIVE",
      "clientIdentifier": "watson",
      "createdAt": "2025-01-14T09:52:06.203Z"
    }
  ],
  "error": null
}
```

## **Deposit Wallets**

A client can have multiple wallets for depositing different currencies. The following APIs help you create and manage deposit wallets.

### Create a Wallet

Using this API you can create a customer wallet which can be later used to receive client funds. If the wallet already exists for a symbol, then the same will be returned to you.

**Conversion currency**

While creating a wallet you can optionally specify a fiat conversion currency tied to that wallet. So any funds deposited in that wallet will be converted to the specified currency and settled with you. 
For example, if you mention the symbol as "USDC_USD", then the customer can deposit USDC in the returned wallet, which will be automatically converted to USD. 

You can specify a crypto without a fiat conversion currency if you like to receive crypto directly. 
For example, specifying symbol as "USDC" will allow the customers to deposit crypto and the same will be settled with you without any conversions.

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/third-party/deposit-wallet/create
```

**Body Parameters**

- `clientIdentifier` (string, required): The unique identifier for the customer. Example: `sherlockholmes`.
- `symbol` (string, required): The cryptocurrency and fiat currency pair. Example: `USDC_USD`.
- `chain` (string, required): The blockchain on which the wallet will be created. Example: `POLYGON`.

**Sample Request**

```json
{
    "clientIdentifier": "sherlockholmes",
    "symbol": "USDC_USD",
    "chain": "POLYGON"
}
```

**Success Response**

```json
{
  "code": 200,
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "asset": "USDC",
    "status": "APPROVED",
    "createdAt": "2025-01-14T09:50:22.539Z",
    "symbol": "USDC_USD"
  },
  "error": null
}
```

Here is a list of supported crypto currencies along with their chains

| Crypto Currencies | Symbol | Supported Blockchains   |
| ----------------- | ------ |-------------------------|
| Tether            | USDT   | Ethereum, Tron*         |
| USD Coin          | USDC   | Polygon, Ethereum, Tron |
| Ethereum          | ETH    | Ethereum                |
| Bitcoin           | BTC    | Bitcoin                 |
| Solana            | SOL    | Solana                  |

&ast; USDT is only available on mainnets.

**Wallet Disabled**

When a wallet is found to be associated with suspicious activities or blacklisted addresses, it will be disabled and a new wallet address will be generated automatically.

**Webhook Event:** `UserWallets.INACTIVE`

```json
{
  "event": {
    "orgId": 10,
    "entity": "UserWallets",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "symbol": "USDC_USD",    
    "chain": "POLYGON",
    "network": "AMOY",
    "status": "INACTIVE",
    "createdAt": "2025-01-14T09:50:22.539Z"
  }
}
```

### List Wallets

This API allows you to fetch all wallets associated with a specific customer.

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/third-party/depoit-wallet/list
```

**Body Parameters**

`clientIdentifier`: The unique identifier of the customer. Example: `sherlockholmes`.

**Example Response**

```json
{
    "code": 200,
    "data": [
        {
            "clientIdentifier": "sherlockholmes",
            "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
            "chain": "POLYGON",
            "network": "AMOY",
            "symbol": "USDC_USD",
            "status": "ACTIVE",
            "createdAt": "2025-01-14T09:50:22.539Z"
        },
        {
            "clientIdentifier": "sherlockholmes",
            "address": "0x7d3e8b7d8d1f3f1f3f1f3f1f3f1f3f1f3f1f3f1f",
            "chain": "ETHEREUM",
            "network": "SEPOLIA",
            "symbol": "USDC_USD",
            "status": "INACTIVE",
            "createdAt": "2025-01-14T09:50:22.539Z"        
        }
    ],
    "error": null
}
```

**Notes**

*	The status field indicates whether the wallet is currently active or inactive.

## **Payins**

To accept Payins, share the deposit wallet address received in the deposit wallet creation API call with the customer. Once the customers transfer funds to their respective wallet address, webhooks are triggered at each stage of the transaction lifecycle.

---

### **Payin Lifecycle Webhooks**

When a customer transfers funds, you'll receive webhooks at different stages of the transaction. Here are the possible webhook events:

**Payin creation**

When a payin is created with Fuze, we will send a webhook.

**Webhook Event:** `Payins.CREATED`

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "CREATED",
    "symbol":  "USDC_USD",
    "quantity": 1000.0, 
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```

**Notes** 
* `quantity` represents the amount in crypto.
* `quoteQuantity` represents the amount in fiat, if currency conversion is applicable for the deposit wallet. Otherwise, it will be equal to `quantity`.
* `symbol` will be of the type `<crypto>_<fiat>`, e.g. `USDC_USD`, if currency conversion is applicable for the deposit wallet. Otherwise, it will be of the type `<crypto>`, e.g. `USDC`.


**Transaction recorded on Blockchain**

When the transaction is detected on the blockchain, we will notify you.

**Webhook Event:** `Payins.TXN_CREATED`

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "TXN_CREATED",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```

**Transaction Initiated**

When a customer initiates a transfer, we start the AML check and notify you.

**Webhook Event:** `Payins.INITIATED`

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "INITIATED",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```

**Transaction Confirmed**

After all checks pass successfully, you'll receive a confirmation webhook.

**Webhook Event:** `Payins.PAID`

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "PAID",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```

**Compliance Review Required**

If a transaction is flagged by our automated AML checks, it undergoes manual compliance review.

**Webhook Event:** `Payins.COMPLIANCE_REVIEW`

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "COMPLIANCE_REVIEW",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```

**Additional Information Required**

The customer is contacted for further clarifying information - on the basis of which a final decision will be made (whether to return, freeze or allow it to be processed).

**Webhook Event:** `Payins.RFI`

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "RFI",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```

**Transaction Rejected**

Customers would be told that funds cannot be processed from the specific wallet used and need to be returned. In such cases, the customer would need to be contacted to get a wallet address to which funds can be sent. Examples of cases where this measure is taken: For indirect exposures like scam, gambling (depending on jurisdiction) etc. which are above minimum thresholds for Fuze.

**Webhook Event:** `Payins.REJECTED`

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "REJECTED",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```

**Funds Frozen**

If a customer / wallet is on a sanctioned list, then the funds will be frozen and no further action can be taken on the account. All customer details would be reported to relevant local authorities. Examples of cases where this measure is taken: For direct exposures to sanctioned entities, known terrorist wallets, etc.

**Webhook Event:** `Payins.FROZEN`

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "FROZEN",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```

**Webhook Summary**

| **Status**          | **Description**                                      |
|---------------------|------------------------------------------------------|
| `CREATED`           | Payin created by Fuze.                               |
| `TXN_CREATED`       | Transaction is recorded on the blockchain.           |
| `INITIATED`         | Transaction initiated and AML check started.         |
| `COMPLIANCE_REVIEW` | Transaction flagged for manual compliance review.    |
| `RFI`               | Additional information requested by compliance team. |
| `REJECTED`          | Transaction rejected, funds to be returned.          |
| `FROZEN`            | Funds have been frozen.                              |
| `PAID`              | Transaction successfully completed.                  |

### **Create a Payin Quote(Optional)**

You can use this API in scenarios where you want to request a quote for an exact amount. For example, you want to receive 100 USD from the customer and the customer will be paying in USDC, then we'll return the exact amount in USDC customer needs to deposit so that you receive 100 USD. The quote will have an expiry time after which the quote will be updated to reflect the latest rates. If the customer pays after the quote has expired then the transaction will go through but the final amount received by you might be different, in case the conversion rate has changed.

The response of the transaction will be `OPEN` - indicating the the request have been received successfully. You will also receive a `id` and a wallet address

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payin/create HTTP/1.1
```

**Body Parameters**

- `clientIdentifier`: The counterparty identifier you passed while creating the counterparty.
- `symbol`: The currency to request payment in.
- `quantity`: The amount of the payment.
- `chain`: The blockchain to use for the transaction.
- `clientOrderId`: Optional idempotency key which ensures the same order is not placed twice.

**Sample Request**

```json
{
    "clientIdentifier": "barbara_allen_2",
    "symbol": "USDC_USD",
    "chain": "POLYGON",
    "quantity": 1000,
    "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a"
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
        "address": "0x8f8e8b3b8b1f3f1f3f1f3f1f3f1f3f1f3f1f3f1f",
        "chain": "POLYGON",
        "network": "AMOY",
        "expiryTime": "2023-06-09T07:53:12.658Z",
        "status": "OPEN"
    },
    "error": null
}
```

### **List Payins**

This API allows you to fetch a list of all Payins for a specific customer.

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payin/list/
```

**Body Parameters**

- `clientIdentifier` (optional): The unique identifier of the customer. Example: `sherlockholmes`
- `startDate`and `endDate` (optional, format: UTC): Filter by date range. Example: `2023-06-08`
- `status` (optional): Filter by status Example: PAID, INITIATED, REJECTED
- `pageSize` (optional, default: 50, max: 100): Number of records per page. Example: 50
- `pageNumber`(optional): Page number. Example: 1

**Response Example**

```json
{
  "code": 200,
  "data": [
    {
      "clientOrderId": "58cde2c6-12a4-4981-94e3-e77a5145d050",
      "status": "PAID",
      "createdAt": "2025-01-14T10:19:45.680Z",
      "symbol": "USDC_USD",
      "quantity": 0.1,
      "quoteQuantity": 0.1,
      "fee": 0.001,
      "vat": 0.00005,
      "expiryTime": 1736861661251,
      "targetName": "sherlock holmes"
    },
    {
      "clientOrderId": "56c48192-5fee-47eb-96d6-fb9ce6fa79d3",
      "status": "QUOTE_EXPIRED",
      "createdAt": "2025-01-14T10:17:27.539Z",
      "symbol": "USDC",
      "quantity": 1,
      "quoteQuantity": 1.1,
      "fee": 0.1,
      "vat": 0.005,
      "targetName": "sherlock holmes"
    }
  ],
  "error": null
}

```

### **Fetch a Payin**

This API allows you to fetch the status of a specific Payin using its `clientOrderId`.

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payin/status/
```

**Body Parameters**

- `clientOrderId`: The unique ID of the Payin

**Response Example**

```json
{
  "code": 200,
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x54556F0ed90Fb6CEBb2201E31287b3478716B933",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId": "9c99dd8e-6b76-45ce-9468-d141dabbf0e9",
    "status": "PAID",
    "symbol": "USDC_USD",
    "quantity": 0.1,
    "quoteQuantity": 0.11,
    "fee": 0.0011,
    "vat": 0.000055,
    "expiryTime": 1736849148122
  },
  "error": null
}
```

## **Payouts**

You can deposit funds in the customer's wallet from your own account using the Payout API.

### **Create a Payout Quote (optional)**

You should generate a Payout quote if you wish to transfer fiat to the customer.


**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payout/quote
```

**Body Parameters**

 - `clientIdentifier` (string): The customer identifier. Example: `sherlockholmes`
- `symbol` (string): Crypto currency to transfer. Example: `USDC`
- `chain` (string): The blockchain to use for the transaction. Example: `POLYGON`
- `quantity` (number, optional): Amount of crypto to transfer to the customer.
- `quoteQuantity` (number, optional): Amount of fiat to transfer to the customer.


**Sample Request**

```json
{
  "clientIdentifier": "sherlockholmes",
  "symbol": "USDC_USD",
  "chain": "POLYGON",
  "quantity": 1
}
```

**Sample Response**

```json
{
  "code": 200,
  "data": {
    "clientIdentifier": "sherlockholmes",
    "quoteId": 556851,
    "symbol": "USDC_AED",
    "quantity": 1,
    "quoteQuantity": 1.1,
    "price": 1.1,
    "expiryTime": 1736852639292
  },
  "error": null
}
```
**Notes**
* Either `quantity` or `quoteQuantity` must be specified for quote generation.
* When using this API, note down the `quoteId` field returned, as it will be used in the Payout creation API.

### **Create a Payout** 

You can initiate a Payout using the following API.  

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payout/create
```

**Body Parameters**

- `clientIdentifier` (string): The counterparty identifier you passed while creating the counterparty. Example: `sherlockholmes`
- `address` (string): The address to send the payout to. 
- `chain` (string): The blockchain to use for the transaction. Example: `POLYGON`
- `symbol` (string): Crypto currency to transfer. Example: `USDC`
- `clientOrderId` (string, optional): Idempotency key of the type uuid v4, which ensures the same order is not placed twice. Fuze will generate a random uuid if not supplied.
- `quantity` (number, optional): Amount of crypto to transfer to the customer.
- `quoteId` (number, optional): Quote ID received from Payout Quote creation API.


**Sample Request**

```json
{
  "clientIdentifier": "sherlockholmes",
  "address": "0x98BCBd9Bd0896A73d5aa0cC880512a3cBCE78401",
  "chain": "POLYGON",
  "symbol": "USDC",
  "quantity": 1
}
```

**Sample Response**

```json
{
  "code": 200,
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x98BCBd9Bd0896A73d5aa0cC880512a3cBCE78401",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId": "c43b2dad-03a0-4d84-9f4b-b5a0cf9cc55b",
    "status": "CREATED",
    "symbol": "USDC",
    "quantity": 1,
    "quoteQuantity": 1,
    "fee": 0.01,
    "vat": 0.0005
  },
  "error": null
}
```

**Notes**
* One of `quoteId` or `quantity` must be specified in the request body. Specify `quoteId` if you wish to transfer fiat to the customer. If the customer is to be paid in crypto, pass `quantity`.

### **Webhook Events for Payout Lifecycle**

Here are the webhook events you'll receive during a payout lifecycle. Each webhook will contain relevant transaction details and a status update. We’ve covered more details about our web-hooks [here](https://docs.fuze.finance/advanced/webhooks).

**1. Payout Initiated**

When a payout request is initiated, you'll receive this event confirming the request has been received and validated.

```json

{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayouts",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "INITIATED",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```


**2. Payout Paid**

This event indicates the payout transaction has been submitted to the blockchain and is being processed.

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayouts",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "PAID",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```

**3. Payout Settled**

This event confirms the funds have been received in the destination wallet. You’ll receive the transaction hash, transaction fees and network fees.

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayouts",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "SETTLED",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```


**4. Payout Failed**

This event indicates the payout could not be completed.

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayouts",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "FAILED",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```

**5. Compliance Review Required**

This event indicates the destination wallet requires a manual compliance review. The funds will be blocked and the transaction will either be completed or rejected post compliance review.

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayouts",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "COMPLIANCE_REVIEW",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```

**6. Wallet Rejected**

This event indicates the destination wallet was rejected by compliance and the payout will be cancelled. You’ll have to initiate a payout with another wallet address.

```json
{
  "event": {
    "orgId": 10,
    "entity": "GatewayPayouts",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x51980d9a87f5de7e1DcdBe2284C39D96eC4C4361",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId":  "47e3bf05-1a91-4f3e-a6b4-3ac99c82eae3",
    "status": "REJECTED",
    "symbol":  "USDC_USD",
    "quantity": 1000.0,
    "quoteQuantity":  1011.0,
    "fee": 0.01,
    "vat": 0.0005,
    "expiryTime": 1736849148122
  }
}
```


### **Fetch a Payout**

This API allows you to fetch the status of a specific Payin using its `clientOrderId`.

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payout/status/
```

**Sample Response**

```json
{
  "code": 200,
  "data": {
    "clientIdentifier": "sherlockholmes",
    "address": "0x5A047dAc44Da3fd4dc7C038aCFD952C70D41781b",
    "chain": "POLYGON",
    "network": "AMOY",
    "clientOrderId": "d91ce7f7-1445-4e23-bfa0-edcb1e69a2f3",
    "status": "PAID",
    "symbol": "USDC_USD",
    "quantity": 1,
    "quoteQuantity": 1.1,
    "fee": 0.005,
    "vat": 0.00025,
    "expiryTime": 1736861661251
  },
  "error": null
}
```

### List Payouts

To get a list of payouts you can use the following API along with query parameters.

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payout/list 
```

**Query Parameters**

- `clientIdentifier` (optional): The unique identifier of the customer. Example: `sherlockholmes`
- `startDate`and `endDate` (optional, format: UTC): Filter by date range. Example: `2023-06-08`
- `status` (optional): Filter by status Example: PAID, INITIATED, REJECTED
- `pageSize` (optional, default: 50, max: 100): Number of records per page. Example: 50
- `pageNumber`(optional): Page number. Example: 1

**Sample Response**

```json
{
  "code": 200,
  "data": [
    {
      "clientOrderId": "c43b2dad-03a0-4d84-9f4b-b5a0cf9cc55b",
      "status": "PAID",
      "createdAt": "2025-01-14T12:07:22.950Z",
      "symbol": "USDC_USD",
      "quantity": 0.01,
      "quoteQuantity": 0.11,
      "fee": 0.0001,
      "vat": 0.000005,
      "expiryTime": 1736861661251,
      "targetName": "sherlock holmes"
    },
    {
      "clientOrderId": "6403745e-d55a-4709-b9f7-8f770db095a6",
      "status": "SETTLED",
      "createdAt": "2025-01-14T11:59:03.751Z",
      "symbol": "USDC",
      "quantity": 0.01,
      "quoteQuantity": 0.01,
      "fee": 0.0001,
      "vat": 0.000005,
      "targetName": "sherlock holmes"
    }
    ],
  "error": null
}
```


### **Processing Refunds**

You can process refunds using the Payout creation API. The request structure is same along with an additional parameter - `parentClientOrderId`. This field is the `clientOrderId` of the Payin for which a refund is to be initiated. You can process refunds for Payins in `COMPLETED` or `REJECTED` status.

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payout/create
```

**Request Body:**

```json
{
  "clientIdentifier": "sherlockholmes",
  "symbol": "USDC_USD",
  "address": "0x5A047dAc44Da3fd4dc7C038aCFD952C70D41781b",
  "chain": "POLYGON",
  "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a",
  "quoteId": 567890,
  "parentUuid": "d91ce7f7-1445-4e23-bfa0-edcb1e69a2f3"
}
```

**Sample Response:**

```json
{
    "code": 200,
    "data": {
      "clientIdentifier": "sherlockholmes",
      "address": "0x5A047dAc44Da3fd4dc7C038aCFD952C70D41781b",
      "chain": "POLYGON",
      "network": "AMOY",
      "clientOrderId": "d91ce7f7-1445-4e23-bfa0-edcb1e69a2f3",
      "status": "PAID",
      "symbol": "USDC_USD",
      "quantity": 1,
      "quoteQuantity": 1.1,
      "fee": 0.005,
      "vat": 0.00025,
      "expiryTime": 1736861661251
    },
    "error": null
}
```

The refund process follows the same webhook lifecycle as regular payouts, with status updates being sent to your webhook endpoint as the refund progresses through various stages.

## **Account Management**

Merchants can manage and monitor their fiat accounts through these endpoints. They allow you to:

- **Check Balances** of different fiat currencies in which your funds are received.
- **List Transactions** (fiat deposits to and withdrawals from your bank account), separate from the Payin/Payout flows described earlier.

### **Check Balances**

Use this endpoint to retrieve the balances for all fiat currencies associated with your account.

**Endpoint**

```
GET https://staging.api.fuze.finance/api/v1/payment/gateway/account/balances
```

**Sample Request**

```bash
curl -X GET "https://staging.api.fuze.finance/api/v1/payment/gateway/account/balances" \
    -H "X-SIGNATURE: <signature>" \
    -H "X-TIMESTAMP: <timestamp>" \
    -H "X-API-KEY: <api_key>" \
    -H "Content-Type: application/json"
```

**Successful Response**

```json
{
  "code": 200,
  "data": [
    {
      "currency": "USD",
      "balance": 10500.75
    },
    {
      "currency": "AED",
      "balance": 2500.00
    },
    {
      "currency": "EUR",
      "balance": 1800.50
    }
  ],
  "error": null
}
```

**Error Example**

```json
{
  "code": 403,
  "data": null,
  "error": "Unathorized"
}
```
