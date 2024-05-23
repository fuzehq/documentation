# Walkthrough: Onramp and Offramp APIs
Onramp and offramp APIs by Fuze offer a simple and straightforward way to convert fiat to digital assets and vice versa
for your users. As you’ll see, you can provide a fully-functional onramp/offramp experience using just 6 API requests.

The documentation is written from an `onramp` stand-point. The only difference for an `offramp` usecase is that you
first deposit your crypto instead of pre-funding your fiat balance.

### Pre-fund fiat balance
To get started with onramping, you need to whitelist a bank account where the fiat funds will be credited or debited.

For our usecase, let's assume that your bank is in UAE and is funded using Dirhams (AED). The following request will
create an account with the required bank details in our system.

```bash
POST https://staging.api.fuze.finance/api/v1/finance/add-account/ HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

{
    "beneficiaryName": "Account1",
    "bankName": "ENBD",
    "bankCountry": "UAE",
    "accountNumber": "account1",
    "transferDetails": "{iban : \"ibanabc\"}"
}
```

You will get an email when the bank account is whitelisted, alternatively you can set up a web hook that will notify you when the whitelisting has been successful.
We’ve covered more details about our web hooks [here](/advanced/webhooks).

Once, you bank account is whitelisted, you can initiate a deposit into the whitelisted account.

```bash
POST https://staging.api.fuze.finance/api/v1/finance/initiate-transaction/ HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

{
    "accountNumber": "Account1",
    "txnId": "Txn1",
    "amount": 1000000
    "transactionType": "DEPOSIT",
    "currency": "AED",
    "fundingAmount": 100000,
    "fundingCurrency": "AED"
}

```

On a successful request, you'll get a `referenceId`, this `referenceId` should be present in the remarks of the bank transfer made to the Fuze bank account to
ensure automatic deposit.

```json
{
    "code": 200,
    "data": [
        {
            "id": 12,
            "orgId": 1,
            "accountId": "Account1",
            "txnId": "Txn1",
            "referenceId": "123123",
            "amount": 123,
            "type": "DEPOSIT",
            "status": "PENDING",
            "currency": "AED",
            "fundingAmount": 123,
            "fundingCurrency": "AED"
        }
    ],
    "error": null
}
```

You can subscribe to the status updates of `DEPOSIT` and `WITHDRAWAL` using webhooks.

### Create a User
All transactions on Fuze are associated with an `orgUserId`. This is a system user against which ledger transactions are
recorded. A ledger for every `orgUserId` is maintained by Fuze, and the balances can be queried at any point.

In the example request below, we’ve passed the `orgUserId` `system_user`

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
    "orgUserId": "system_user",
    "userType": "CONSUMER",
    "kyc": true,
    "tnc": true
}
```

A successful response will look as follows:
```json

    "code": 200,
    "data": {
        "orgUserId": "system_user",
        "orgId": 10,
        "tnc": true,
        "kyc": true,
        "userType": "CONSUMER",
        "userStatus": "ACTIVE"
    },
    "error": null
}
```

You can also check balances of this `system_user` using the endpoint below.

```bash
POST https://staging.api.fuze.finance/api/v1/user/balance/ HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

{
    "orgUserId": "system_user",
}
```

Since this is a user that was just created, there are currently no balances against this user.

```json
{
    "code": 200,
    "data": {
        "balance": []
    },
    "error": null
}
```

### Onramp crypto
Now that you have fiat balances and an `orgUserId`. You can now onramp the assets for `system_user`.

To place an order,  you will need to pass the `orgUserId`, along with the `symbol`, `quantity` and the `operation`.

- `orgUserId`: The user.
- `symbol`: The digital asset that you want to onramp or offramp, example `USDC_AED`.
- `quoteQuantity`: The amount in fiat to onramp or offramp.
- `operations`: BUY for onramp or SELL for offramp.

So if you want to onramp system_user with 100 USD worth of BTC, you pass the request below:

```bash
POST https://staging.api.fuze.finance/api/v1/trading/ HTTP/1.1
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
    "orgUserId": "system_user",
    "symbol": "USDC_AED",
    "operation": "BUY",
    "quoteQuantity": 1000000,
}
```

A successful response will contain an `id` which can be used to query the status of the order later.

```json
{
    "code": 200,
    "data": {
        "id": 107,
        "orgId": 28,
        "orgUserId": "system_user",
        "symbol": "USDC_AED",
        "side": "BUY",
        "quoteQuantity": 1000000,
        "rejectionReason": null,
        "filled": 0
    },
    "error": null
}
```

Orders are almost always instant. Nonetheless, you can set up a web hook that will notify you whether the transaction was successful. We’ve covered more details about our web hooks [here](/advanced/webhooks).

To check the status of the order, using REST, use the `id` obtained while creating the order:

```bash
GET https://staging.api.fuze.finance/api/v1/trading/orders/107 HTTP/1.1
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
        "orgId": 28,
        "orgUserId": "system_user",
        "symbol": "BTC_USD",
        "price": 0,
        "averagePrice": 1,
        "side": "BUY",
        "quoteQuantity": 1000000,
        "filled": 1000000,
        "status": "COMPLETED",
        "rejectionReason": null,
        "createdAt": "2023-06-08T07:53:11.688Z",
        "updatedAt": "2023-06-08T07:53:12.658Z"
    },
    "error": null
}
```

### View balances
You can now fetch the balances of your account by using the previously defined `orgUserId`.

```bash
POST https://staging.api.fuze.finance/api/v1/user/holdings/ HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

{
    "orgUserId": "system_user",
}
```

In the response, you will see the users’ balances.

```json
{
    "code": 200,
    "data": [
        {
            "asset": "USDC",
            "quantity": 1000000,
            "currency": "USD",
            "message": null
        }
    ],
    "error": null
}
```

### Withdrawal to wallet
Once a address has been whitelisted, you can withdraw assets to the whitelisted address using the following API call.

```bash
POST https://staging.api.fuze.finance/api/v1/custody/withdraw/ HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

{
    "orgUserId": "system_user",
    "amount": 100000,
    "asset": "USDC",
    "chain": "ETHEREUM",
    "address": "0xaddress"
}
```

A successful response will have a transaction id that you can use to query for transactions.

```json
{
    "code": 200,
    "data": [
        {
            "id": 12,
            "amount": 100000,
            "txnId": "usdc-eth-withdrawal",
            "asset": "USDC",
            "chain": "ETHEREUM",
            "status": "PENDING",
            "entry": "WITHDRAWAL"
        }
    ],
    "error": null
}
```

To query the status of transactions, you can make a POST request with the following parameters:

```bash
POST https://staging.api.fuze.finance/api/v1/custody/transactions/ HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Postman-Token: <>
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

{
    "orgUserId": "system_user",
    "asset": "USDC",
    "chain": "ETHEREUM",
    "status": "COMPLETED",
}
```

A successful response will have the following structure with the transaction details:

```json
{
    "code": 200,
    "data": {
        "txns": [
            {
                "amount": 100000,
                "txnId": "ed2b021a-a11f-498e-b47d-c15efd0cb5a5",
                "currency": "ETH",
                "entry": "DEPOSIT",
                "status": "COMPLETED",
                "createdAt": "2023-11-09T08:56:47.300Z",
                "updatedAt": "2023-11-09T08:56:47.300Z"
            }
        ]
    },
    "error": null
}
```
