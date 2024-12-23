# Walkthrough: Payment APIs

The Fuze Pay API allows merchants to seamlessly accept and disburse cryptocurrency payments while ensuring compliance through built-in KYC and AML checks. This document provides a comprehensive walkthrough of core API calls—customer management, deposit wallets, payins, payouts, settlements, and account management.

## API Environments

Fuze provides two primary environments for developers: **Staging** and **Production**. Each environment has its own base URL and purpose, ensuring you can safely test your integration before handling live transactions.

| **Environment** | **Base URL** | **Purpose** |
| --- | --- | --- |
| **Staging** | https://staging.api.fuze.finance | Used for **testing and development**. This environment often points to **test networks**(e.g., test blockchains) and allows you to validate integrations without real financial risk. |
| **Production** | https://api.fuze.finance | Used for **live transactions**. This environment handles **real customer funds** and production data. All compliance rules apply here. |

## **Common API Headers**

The following headers are required across all API endpoints unless otherwise specified:

| **Header Name** | **Description** | Value |
| --- | --- | --- |
| X-SIGNATURE | Digital signature used for request authentication. | d0f8e2c8... |
| X-TIMESTAMP | Unix timestamp of the request to ensure the request is current. | 1687944000 |
| X-API-KEY | Unique API key for authorization. | api_key_example12345 |
| Content-Type | Specifies the type of the content in the request body. | application/json |

This section applies globally to all APIs. Specific header usage will still be mentioned in individual API details if required.

## **Manage Customers**

You can add a customer via the endpoint. You will need to pass a `kycData`, and unique `clientIdentifier` This clientIdentifier will be used to identify the counterparty in all future transactions.

### Create Customer

Once you’ve uploaded the documents, you can create a customer using the following API

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/third-party/create/
```

**Body Parameters**

- `clientIdentifier` (string, required): The unique identifier for the customer. Example: `sherlockholmes19`.
- `kycData` (object, required): KYC details for the customer, including:
    - `fullName` (string, required): Customer's full name. Example: `sherlock holmes 19`.
    - `email` (string, required): Customer's email. Example: `sherlockholmes19@baker.st`.
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
  "clientIdentifier": "barbara_allen_2",    
  "type": "THIRD_PARTY",
  "sumsubToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGllbnRfaWQiLCJleHAiOjE2ODAwMDAwMDAsImlhdCI6MTY4MDAwMDAwMCwiaXNzIjoic3Vtc3ViIn0.W6lTRbXMDmsoVqPyVduVn2Tr3EEdkgJEsnR69G1d9CQ",
  "kycData": {
	"fullName": "sherlock holmes 19",
	"entityType": "individual",
	"email": "sherlockholmes19@baker.st",
	"addressLine1": "221B",
	"addressLine2": "Baker St",
	"city": "London",
	"state": "London",
	"country": "GB",
	"postalCode": "NW16XE"
  },
}
```

A successful response will look as follows:

```json
{
     "code": 200,
     "data": {
        "uuid": "057d6edf-70d4-4bdb-985f-723ada5adae1",     
	"clientIdentifier": "barbara_allen_2",
        "status": "STARTED",
        "createdAt": "2024-11-21T06:42:48.209Z"        
     }
     "error": null
}
```

Based on the customer lifecycle events you’ll receive the following webhooks

**Account Approved**

After the account is approved you can start creating payins and payouts.

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
    "clientIdentifier": "<client_identifier>",
    "uuid": "057d6edf-70d4-4bdb-985f-723ada5adae1",
    "status": "ACTIVE",
    "reason": null
  }
}
```

**Compliance Follow Up**

In case the Fuze compliance team needs further information/clarifications you’ll receive this web-hook. You’ll receive reasons for rejection along with the documents which had problems. To solve this you need to resolve it with our compliance team offline.

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
    "clientIdentifier": "<client_identifier>",
    "uuid": "057d6edf-70d4-4bdb-985f-723ada5adae1",
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
    "clientIdentifier": "<client_identifier>",
    "uuid": "057d6edf-70d4-4bdb-985f-723ada5adae1",
    "status": "FAILED",
    "reason": "<reason>"
  }
}
```

**Account Suspended**

No further action can be taken on the account. And all customer details would be reported to relevant local authorities. Examples of this action include cases where the funds end up in a sanctioned entity, or if the wallet added for whitelisting was tied to terrorist financing or sanctioned entities.

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
    "clientIdentifier": "<client_identifier>",
    "uuid": "057d6edf-70d4-4bdb-985f-723ada5adae1",
    "status": "INACTIVE",
    "reason": "<reason>"
  }
}
```

### **Fetch a Customer**

You can retrieve customer details using the following API. This allows you to check the current status, KYC information, and associated documents of a specific customer.

**Endpoint**

```
GET https://staging.api.fuze.finance/api/v1/payment/gateway/third-party/{clientIdentifier}
```

**Path Parameter**

- `clientIdentifier` (string, required) - The unique identifier of the customer you want to fetch. Example: `barbara_allen_2`

**Successful Response**

```json
{
    "code": 200,
    "data": {
        "clientIdentifier": "barbara_allen_2",
        "name": "sherlock holmes",
        "email": "sherlockholmes@baker.st",				
        "status": "COMPLETED",
        "uuid": "057d6edf-70d4-4bdb-985f-723ada5adae1",
        "createdAt": "2024-11-21T06:42:48.209Z"
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

## **Deposit Wallets**

A client can have multiple wallets for depositing different currencies. The following APIs help you create and manage deposit wallets.

### Create a Wallet

Using this API you can create a customer wallet which can be later used to receive client funds. If the wallet already exists for a symbol, then the same will be returned to you.

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/third-party/deposit-wallet/create
```

**Body Parameters**

- `clientIdentifier` (string, required): The unique identifier for the customer. Example: `barbara_allen_2`.
- `symbol` (string, required): The cryptocurrency and fiat currency pair. Example: `USDC_USD`.
- `chain` (string, required): The blockchain on which the wallet will be created. Example: `ETHEREUM`.

**Sample Request**

```json
{
    "clientIdentifier": "barbara_allen_2",
    "symbol": "USDC_USD",
    "chain": "ETHEREUM",
}
```

**Success Response**

```json
{
    "uuid": "",
    "clientIdentifier": "barbara_allen_2",
    "address": "0x8f8e8b3b8b1f3f1f3f1f3f1f3f1f3f1f3f1f3f1f",
    "symbol": "USDC",	
    "chain": "ETHEREUM",
    "network": "MAINNET",
    "status": "ACTIVE"
}
```

Here is a list of supported crypto currencies along with their networks and chains

| Crypto Currencies | Symbol | Supported Blockchains |
| --- | --- | --- |
| Tether | USDT | Ethereum, Tron |
| USD Coin | USDC | Ethereum, Tron |
| Ethereum | ETH | Ethereum |
| Bitcoin | BTC | Bitcoin |
| Solana | SOL | Solana |
| Ripple | XRP | RippleNet |

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
    "clientIdentifier": "<client_identifier>",
    "address": "<wallet_address>",
    "symbol": "USDT_USD",        
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "INACTIVE",
    "createdAt": "<timestamp>"
  }
}
```

### List Wallets

This API allows you to fetch all wallets associated with a specific customer.

**Endpoint**

```
GET https://staging.api.fuze.finance/api/v1/payment/gateway/third-party/depoit-wallet/list?clientIdentifier=<clientIdentifier> HTTP/1.1
```

**Query Parameter**

clientIdentifier: The unique identifier of the customer (e.g., barbara_allen_2).

**Example Response**

```json
{
    "code": 200,
    "data": [
        {
            "clientIdentifier": "barbara_allen_2",
            "address": "0x8f8e8b3b8b1f3f1f3f1f3f1f3f1f3f1f3f1f3f1f",
            "chain": "ETHEREUM",
            "network": "MAINNET",
            "symbol": "USDT_USD",
            "status": "ACTIVE",
            "createdAt": "<timestamp>"
        },
        {
            "clientIdentifier": "barbara_allen_2",
            "address": "0x7d3e8b7d8d1f3f1f3f1f3f1f3f1f3f1f3f1f3f1f",
            "chain": "ETHEREUM",
            "network": "MAINNET",
            "symbol": "USDT_USD",
            "status": "INACTIVE",
            "createdAt": "<timestamp>"            
        }
    ],
    "error": null
}
```

**Notes**

•	The status field indicates whether the wallet is currently active or inactive.

## **Payins**

To accept Payins, share the deposit wallet address received in the previous API call with the customer. Once the customers transfer funds to their respective wallet address, webhooks are triggered at each stage of the transaction lifecycle.

---

### **Payin Lifecycle Webhooks**

When a customer transfers funds, you'll receive webhooks at different stages of the transaction. Here are the possible webhook events:

#### Transaction Initiated

When a customer initiates a transfer, we start the AML check and notify you.

**Webhook Event:** `Payins.INITIATED`

```json
{
  "event": {
    "orgId": 10,
    "entity": "Payins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "uuid": "",
    "clientIdentifier": "<client_identifier>",
    "symbol": "<crypto_currency>_<fiat_currency>",
    "quantity": 1000.0, // Amount in crypto
    "address": "<wallet_address>",
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "INITIATED",
    "createdAt": "<timestamp>"
  }
}
```

#### Transaction Confirmed

After all checks pass successfully, you'll receive a confirmation webhook.

**Webhook Event:** `Payins.PAID`

```json
{
  "event": {
    "orgId": 10,
    "entity": "Payins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "uuid": "",
    "clientIdentifier": "<client_identifier>",
    "symbol": "<crypto_currency>_<fiat_currency>",
    "quantity": 1000, // Amount in crypto,
    "address": "<wallet_address>",
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "PAID",
    "createdAt": "<timestamp>"
  }
}
```

#### Compliance Review Required

If a transaction is flagged by our automated AML checks, it undergoes manual compliance review.

**Webhook Event:** `Payins.COMPLIANCE_REVIEW`

```json
{
  "event": {
    "orgId": 10,
    "entity": "Payins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "uuid": "",
    "clientIdentifier": "<client_identifier>",
    "symbol": "<crypto_currency>_<fiat_currency>",
    "quantity": 1000, // Amount in crypto,
    "address": "<wallet_address>",
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "COMPLIANCE_REVIEW",
    "createdAt": "<timestamp>"
  }
}
```

#### Additional Information Required

The customer is contacted for further clarifying information - on the basis of which a final decision will be made (whether to return, freeze or allow it to be processed).

**Webhook Event:** `Payins.RFI`

```json
{
  "event": {
    "orgId": 10,
    "entity": "Payins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "uuid": "",
    "clientIdentifier": "<client_identifier>",
    "symbol": "<crypto_currency>_<fiat_currency>",
    "quantity": 1000, // Amount in crypto
    "address": "<wallet_address>",
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "RFI",
    "createdAt": "<timestamp>"
  }
}
```

#### Transaction Rejected

Customers would be told that funds cannot be processed from the specific wallet used and need to be returned. In such cases, the customer would need to be contacted to get a wallet address to which funds can be sent. Examples of cases where this measure is taken: For indirect exposures like scam, gambling (depending on jurisdiction) etc. which are above minimum thresholds for Fuze.

**Webhook Event:** `Payins.REJECTED`

```json
{
  "event": {
    "orgId": 10,
    "entity": "Payins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "uuid": "",
    "clientIdentifier": "<client_identifier>",
    "symbol": "<crypto_currency>_<fiat_currency>",
    "quantity": 1000, // Amount in crypto,
    "address": "<wallet_address>",
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "REJECTED",
    "createdAt": "<timestamp>"
  }
}
```

#### Funds Frozen

If a customer / wallet is on a sanctioned list, then the funds will be frozen and no further action can be taken on the account. All customer details would be reported to relevant local authorities. Examples of cases where this measure is taken: For direct exposures to sanctioned entities, known terrorist wallets, etc.

**Webhook Event:** `Payins.FROZEN`

```json
{
  "event": {
    "orgId": 10,
    "entity": "Payins",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "uuid": "",
    "clientIdentifier": "<client_identifier>",
    "symbol": "<crypto_currency>_<fiat_currency>",
    "quantity": 1000, // Amount in crypto
    "address": "<wallet_address>",
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "FROZEN",
    "createdAt": "<timestamp>"
  }
}
```

### 

```json
{
    "code": 200,
    "data": {
        "id": "<transaction_id>",
        "clientIdentifier": "<client_identifier>",
        "symbol": "<crypto_currency>_<fiat_currency>",
        "quantity": 1000, // Amount in crypto
        "address": "<wallet_address>",
        "chain": "<blockchain_chain>",
        "network": "<blockchain_network>",
        "status": "REJECTED",
        "reason": "<rejection_reason>",
        "timestamp": "<timestamp>"
    },
    "error": null
}

```

**Webhook Summary**

| **Status** | **Description** |
| --- | --- |
| `INITIATED` | Transaction initiated and AML check started. |
| `COMPLIANCE_REVIEW` | Transaction flagged for manual compliance review. |
| `RFI` | Additional information requested by compliance team. |
| `REJECTED` | Transaction rejected, funds to be returned. |
| `FROZEN` | Funds have been frozen. |
| `PAID` | Transaction successfully completed. |

### **List Payins**

This API allows you to fetch a list of all Payins for a specific customer.

**Endpoint**

```
GET https://staging.api.fuze.finance/api/v1/payment/gateway/payin/list/
```

**Query Parameters**

- `clientIdentifier`: The unique identifier of the customer (e.g., `barbara_allen_2`). Optional
- `startDate`and`endDate`: Filter transactions by date range (format: UTC). Optional.
- `status`: Filter transactions by status (e.g., PAID, INITIATED, REJECTED). Optional.
- `pageToken`: Token for the next page of results. Optional.
- `pageSize`: Number of records per page (default: 10, max: 100). Optional.

**Response Example**

```json
{
    "code": 200,
    "data": [
        {
            "uuid": "",
            "clientIdentifier": "barbara_allen_2",
            "symbol": "USDC",
            "quantity": 1000,
            "address": "0x8f8e8b3b8b1f3f1f3f1f3f1f3f1f3f1f3f1f3f1f",
            "chain": "ETHEREUM",
            "network": "MAINNET",
            "status": "PAID",
            "createdAt": "2023-06-08T07:53:11.688Z"
        },
        {
            "uuid": "",
            "clientIdentifier": "barbara_allen_2",
            "symbol": "BTC",
            "quantity": 0.5,
            "address": "1BTCwallet123456789",
            "chain": "BITCOIN",
            "network": "MAINNET",
            "status": "REJECTED",
            "createdAt": "2023-06-08T07:54:12.123Z"
        }
    ],
    "error": null
}

```

### **Fetch Payin Status**

This API allows you to fetch the status of a specific Payin using the `id` obtained during the transaction creation.

**Endpoint**

```
GET https://staging.api.fuze.finance/api/v1/payment/gateway/payin/status/{id}
```

**Path Parameter**

- `id`: The unique ID of the Payin

**Response Example**

```json
{
    "code": 200,
    "data": {
        "uuid": "2f9a7b4d-e1c3-5m8n-9p2q-r4s6t8u0v3w5",
        "clientIdentifier": "sherlockholmes02",
        "clientOrderId": "6c8a9ac0-f688-4cf2-903a-d3946d6e06a7",
        "status": "CREATED",
        "address": "tb1qhqjcuxmzapapy78h3xykrh0jzcez3q7d54gtwr",
        "chain": "ETHEREUM",
        "network": "TESTNET",
        "symbol": "USDT_USD",
        "quantity": 1000.0, // The crypto amount received
        "convertedAmount": 1000.0, // The amount after converting to fiat
        "transactionFees": 5 // Fees in fiat
    },
    "error": null
}
```

## **Payouts**

Unlike a payin, a payout is a two step process. The first step is generating a quote for the payout, and the second step is executing the payout.

### **Create a Payout**

If you are okay with the quote, you can execute the payout using the `payout` endpoint. You will need to pass the following parameters:

- `clientIdentifier`: The counterparty identifier you passed while creating the counterparty.
- `quoteId`: The id of the quote you received in the previous step.
- `address`: The address to send the payout to.
- `chain`: The blockchain to use for the transaction.
- `network`: The network to use for the transaction.
- `clientOrderId`: Optional idempotency key which ensures the same order is not placed twice.

The response of the transaction will be `OPEN` - indicating the the request have been received successfully. You will also receive a `id` and a payment link.

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payout/create
```

**Request Body:**

```jsx
{
    "clientIdentifier": "barbara_allen_2",
    "quantity": 500, // Amount in crypto to transfer
    "symbol": "USDC_USD",
    "walletAddress": "tb1qhqjcuxmzapapy78h3xykrh0jzcez3q7d54gtwr",
    "chain": "ETHEREUM",
    "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a" // optional
}
```

A successful response will contain an `id` which can be used to query the status of the order later.

```json
{
    "code": 200,
    "data": {
        "uuid": "",
        "clientIdentifier": "sherlockholmes02",
        "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a",
        "status": "PENDING",
        "address": "tb1qhqjcuxmzapapy78h3xykrh0jzcez3q7d54gtwr",
        "chain": "ETHEREUM",
        "network": "TESTNET",
        "symbol": "USDT_USD",
        "quantity": 1000.0, // in crypto
    },
    "error": null
}
```

### **Webhook Events for Payout Lifecycle**

Here are the webhook events you'll receive during a payout lifecycle. Each webhook will contain relevant transaction details and a status update. We’ve covered more details about our web-hooks [here](https://docs.fuze.finance/advanced/webhooks).

**1. Payout Created**

When a payout request is initiated, you'll receive this event confirming the request has been received and validated.

```json

{
  "event": {
    "orgId": 10,
    "entity": "Payouts",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "uuid": "1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    "clientIdentifier": "<client_identifier>",
    "symbol": "<crypto_currency>_<fiat_currency>",
    "quantity": 1000, // Amount in crypto
    "address": "<wallet_address>",
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "CREATED",
    "createdAt": "<timestamp>"
  }
}
```

**2. Wallet Flagged**

This event indicates the destination wallet requires a manual compliance review. The funds will be blocked and the transaction will either be completed or rejected post compliance review.

```json
{
  "event": {
    "orgId": 10,
    "entity": "Payouts",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "uuid": "",
    "clientIdentifier": "<client_identifier>",
    "symbol": "<crypto_currency>_<fiat_currency>",
    "quantity": 1000, // Amount in crypto
    "address": "<wallet_address>",
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "WALLET_FLAGGED",
    "createdAt": "<timestamp>"
  }
}
```

**3. Wallet Rejected**

This event indicates the destination wallet was rejected by compliance and the payout will be cancelled. You’ll have to initiate a payout with another wallet address.

```json
{
  "event": {
    "orgId": 10,
    "entity": "Payouts",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "uuid": "",
    "clientIdentifier": "<client_identifier>",
    "symbol": "<crypto_currency>_<fiat_currency>",
    "quantity": 1000, // Amount in crypto
    "address": "<wallet_address>",
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "WALLET_REJECTED",
    "createdAt": "<timestamp>"
  }
}
```

**4. Payout Paid**

This event indicates the payout transaction has been submitted to the blockchain and is being processed.

```json
{
  "event": {
    "orgId": 10,
    "entity": "Payouts",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "uuid": "",
    "clientIdentifier": "<client_identifier>",
    "symbol": "<crypto_currency>_<fiat_currency>",
    "quantity": 1000, // Amount in crypto
    "address": "<wallet_address>",
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "PAID",
    "createdAt": "<timestamp>"
  }
}
```

**5. Payout Settled**

This event confirms the funds have been received in the destination wallet. You’ll receive the transaction hash, transaction fees and network fees. 

```json
{
  "event": {
    "orgId": 10,
    "entity": "Payouts",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "uuid": "",
    "clientIdentifier": "<client_identifier>",
    "symbol": "<crypto_currency>_<fiat_currency>",
    "quantity": 1000, // Amount in crypto
    "address": "<wallet_address>",
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "SETTLED",
    "transactionFees": 5, // in fiat
    "networkFees": 0.01, // in crypto crypto 
    "txHash": "<transaction hash>",
    "createdAt": "<timestamp>"
  }
}
```

**6. Payout Failed**

This event indicates the payout could not be completed.

```json
{
  "event": {
    "orgId": 10,
    "entity": "Payouts",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "uuid": "",
    "clientIdentifier": "<client_identifier>",
    "symbol": "<crypto_currency>_<fiat_currency>",
    "quantity": 1000, // Amount in crypto,
    "address": "<wallet_address>",
    "chain": "<blockchain_chain>",
    "network": "<blockchain_network>",
    "status": "FAILED",
    "createdAt": "<timestamp>"
  }
}
```

### **Fetch a Payout**

To check the status of the payment, using REST, use the `id` obtained while creating the order:

**Endpoint**

```
GET https://staging.api.fuze.finance/api/v1/payment/gateway/payout/{clientOrderId} 
```

**Sample Response**

```json
{
    "code": 200,
    "data": {
        "clientIdentifier": "sherlockholmes11",
        "clientOrderId": "9b941897-c004-4802-945c-5c3d339883da",
        "status": "INITIATED",
        "address": "0x5A047dAc44Da3fd4dc7C038aCFD952C70D41781b",
        "chain": "ETHEREUM",
        "network": "SEPOLIA",
        "symbol": "USDC_USD",
        "quantity": 0.0100000017
    },
    "error": null
}
```

### **Processing Refunds**

You can process refunds using the payout API. The request structure is same along with an additional parameter for the original payin under the key `parentUuid`. It allows you to process refunds for payins in “COMPLETED” or “REJECTED” status. 

**Endpoint**

```
POST https://staging.api.fuze.finance/api/v1/payment/gateway/payout/create
```

**Request Body:**

```jsx
{
    "clientIdentifier": "barbara_allen_2",
    "quantity": 500,
    "symbol": "USDC_USD",
    "address": "tb1qhqjcuxmzapapy78h3xykrh0jzcez3q7d54gtwr",
    "chain": "ETHEREUM",
    "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a",
    "parentUuid": "pay_123456789" // ID of the original payin to be refunded
}
```

**Sample Response:**

```json
{
    "code": 200,
    "data": {
        "uuid": "",
        "clientIdentifier": "barbara_allen_2",
        "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a",
        "payinId": "pay_123456789",
        "status": "PENDING",
        "address": "tb1qhqjcuxmzapapy78h3xykrh0jzcez3q7d54gtwr",
        "chain": "ETHEREUM",
        "network": "TESTNET",
        "symbol": "USDC_USD",
        "quantity": 500.0
    },
    "error": null
}
```

The refund process follows the same webhook lifecycle as regular payouts, with status updates being sent to your webhook endpoint as the refund progresses through various stages.

### List Payouts

To get a list of payouts you can use the following API along with query parameters

**Endpoint**

```
GET https://staging.api.fuze.finance/api/v1/payment/gateway/payout/list 
```

**Query Parameters**

- `clientIdentifier`: The unique identifier of the customer (e.g., `barbara_allen_2`). Optional
- `startDate`and`endDate`: Filter transactions by date range (format: UTC). Optional.
- `status`: Filter transactions by status (e.g., PAID, INITIATED, REJECTED). Optional.
- `pageNumber`: Page number to be retrieved for pagination. Optional
- `pageSize`: Number of records to fetch in each page. Optional

**Sample Response**

```json
{
    "code": 200,
    "data": [
	    {
	        "clientIdentifier": "sherlockholmes11",
	        "clientOrderId": "9b941897-c004-4802-945c-5c3d339883da",
	        "status": "INITIATED",
	        "address": "0x5A047dAc44Da3fd4dc7C038aCFD952C70D41781b",
	        "chain": "ETHEREUM",
	        "network": "SEPOLIA",
	        "symbol": "USDC_USD",
	        "quantity": 0.0100000017
	    },
	    {
	        "clientIdentifier": "sherlockholmes11",
	        "clientOrderId": "9b941897-c004-4802-945c-5c3d339883da",
	        "status": "INITIATED",
	        "address": "0x5A047dAc44Da3fd4dc7C038aCFD952C70D41781b",
	        "chain": "ETHEREUM",
	        "network": "SEPOLIA",
	        "symbol": "USDC_USD",
	        "quantity": 0.0100000017
	    }
	  ],
    "error": null
}
```

## **Settlements API**

The Settlements API provides details about daily settlements processed on a **T+2 schedule**. Settlements are calculated based on the **crypto payins (converted to fiat)** and **fiat payouts (converted to crypto)** associated with a merchant. The net settlement amount reflects the balance after accounting for these transactions and is settled in fiat with the merchant.

### **List Settlements**

The List Settlements API allows you to fetch a list of settlements for a merchant over a specified time period. Settlements can be filtered based on date range, status, type, and pagination parameters.

**Endpoint**

```
GET https://staging.api.fuze.finance/api/v1/payment/gateway/settlements/list
```

**Query Parameters**

- `startDate`: The start date for filtering settlements in UTC format. Required.
- `endDate`: The end date for filtering settlements in UTC format. Required.
- `status`: Filter settlements by status (PENDING, COMPLETED, etc.). Optional.
- `type`: Filter settlements by type (POSITIVE, NEGATIVE). Optional.
- `pageNumber`: Page number to be retrieved for pagination. Optional.
- `pageSize`: Number of records to fetch in each page. Default is 50. Optional.

**Sample Request**

```bash
curl -X GET "https://staging.api.fuze.finance/api/v1/settlements?startDate=2023-12-01&endDate=2023-12-10&status=COMPLETED&type=POSITIVE&limit=10&offset=0" \
    -H "X-SIGNATURE: &lt;signature&gt;" \
    -H "X-TIMESTAMP: &lt;timestamp&gt;" \
    -H "X-API-KEY: &lt;api_key&gt;" \
    -H "User-Agent: PostmanRuntime/7.32.2" \
    -H "Accept: */*"
```

**Successful Response**

```json
{
  "code": 200,
  "data": {
    "settlements": [
      {
        "settlementId": "settlement_20231210_001",
        "date": "2023-12-10",
        "status": "COMPLETED",
        "netAmount": 4500,
        "currency": "USD",
        "type": "RECEIVABLE"
      },
      {
        "settlementId": "settlement_20231209_001",
        "date": "2023-12-09",
        "status": "COMPLETED",
        "netAmount": -2000,
        "currency": "USD",
        "type": "PAYABLE"
      }
    ]
  },
  "error": null
}
```

**Error Response**

```json
{
  "code": 400,
  "error": {
    "message": "Invalid date range",
    "details": "The startDate must be earlier than the endDate."
  }
}
```

### **Fetch Settlement**

This API allows you to fetch settlement details, including the list of payins and payouts contributing to the settlement.

**Endpoint**

```
GET https://staging.api.fuze.finance/api/v1/settlements/{settlementId}
```

**Path Parameter**

- settlementId (string, required): The unique identifier for the settlement. Example: settlement_20231219_001.

**Sample Request**

```bash
curl -X GET "https://staging.api.fuze.finance/api/v1/settlements/settlement_20231219_001" \
    -H "X-SIGNATURE: <signature>" \
    -H "X-TIMESTAMP: <timestamp>" \
    -H "X-API-KEY: <api_key>" \
    -H "User-Agent: PostmanRuntime/7.32.2" \
    -H "Accept: */*"
```

**Successful Response**

```json
{
  "code": 200,
  "data": {
    "settlementId": "settlement_20231219_001",
    "date": "2023-12-19",
    "status": "COMPLETED",
    "netAmount": 5000,
    "currency": "USD",
    "payins": [
      {
        "id": "payin_001",
        "cryptoAmount": 1.5,
        "cryptoCurrency": "BTC",
        "fiatAmount": 3000,
        "fiatCurrency": "USD",
        "conversionRate": 20000,
        "status": "PAID",
        "createdAt": "2023-12-17T10:00:00.000Z"
      },
      {
        "id": "payin_002",
        "cryptoAmount": 2000,
        "cryptoCurrency": "USDC",
        "fiatAmount": 2000,
        "fiatCurrency": "USD",
        "conversionRate": 1,
        "status": "PAID",
        "createdAt": "2023-12-17T15:00:00.000Z"
      }
    ],
    "payouts": [
      {
        "id": "payout_001",
        "fiatAmount": 500,
        "fiatCurrency": "USD",
        "cryptoAmount": 0.025,
        "cryptoCurrency": "BTC",
        "conversionRate": 20000,
        "status": "COMPLETED",
        "createdAt": "2023-12-17T12:00:00.000Z"
      }
    ]
  },
  "error": null
}
```

**Error Example**

```json
{
  "code": 404,
  "error": {
    "message": "Settlement not found",
    "details": "No settlement with the ID 'settlement_20231219_001' was found."
  }
}
```

**How Settlements Work**

1. **Crypto Payins**

Customers transfer crypto assets to their wallets. These payins are converted into fiat using the prevailing conversion rate and added to the settlement.

**Example:**

- 1.5 BTC received, conversion rate = $20,000 → Fiat equivalent = $30,000.

2. **Fiat Payouts**

Merchants initiate payouts in fiat, and the corresponding crypto amount is sent to the customer based on the conversion rate.

**Example**:

- $500 fiat payout, conversion rate = $20,000 → Crypto equivalent = 0.025 BTC.

3. **Net Settlement**

The settlement aggregates the fiat amounts from payins and payouts, resulting in a **net amount** payable or receivable by the merchant.

# **Account Management**

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
  "error": "Unathorized",
}
```
