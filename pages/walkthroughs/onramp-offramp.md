# Onramp and offramp
Onramp and offramp APIs by Fuze offer a simple and straightforward way to convert fiat to digital assets and vice versa
for your users. As you’ll see, you can provide a fully-functional onramp/offramp experience using just 6 API requests.

### Create a User
All transactions on Fuze are associated with an `orgUserId`. This can be any string that uniquely identifies your users within your systems. It can be a user name, or even a `UUID`. A ledger for every `orgUserId` is maintained by Fuze, and the balances can be queried at any point.

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
        "userStatus": "ACTIVE"
    },
    "error": null
}
```

You can also check balances of this `barbara_allen_2` using the endpoint below.

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
    "orgUserId": "barbara_allen_2",
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

### Pre-fund fiat balance
To begin the onramp-offramp procedure, you need to whitelist a bank account where the funds will be credited or debited.

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

You will get an email when the bank account is whitelisted or you can set up a web hook that will notify you when the whitelisting has been successful.
We’ve covered more details about our web hooks [here](/advanced/webhooks).

### Onramp/offramp crypto
You can now onramp/offramp requests orders for `orgUserId`.

To place an order,  you will need to pass the `orgUserId`, along with the `symbol`, `quantity` and the `operation`.

- `orgUserId`: The user.
- `symbol`: The digital asset that you want to onramp or offramp, example `BTC_USD`.
- `quoteQuantity`: The amount in fiat to onramp or offramp.
- `operations`: BUY for onramp or SELL for offramp.

So if you want to onramp barbara_allen_2 with 100 USD worth of BTC, you pass the request below:

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
    "orgUserId": "barbara_allen_2",
    "symbol": "BTC_USD",
    "operation": "BUY",
    "quoteQuantity": 100,
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
        "symbol": "BTC_USD",
        "side": "BUY",
        "quantity": 0.01,
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
        "orgUserId": "barbara_allen_2",
        "symbol": "BTC_USD",
        "price": 0,
        "averagePrice": 35000,
        "side": "BUY",
        "quoteQuantity": 0.01,
        "filled": 0.00285714,
        "status": "COMPLETED",
        "rejectionReason": null,
        "createdAt": "2023-06-08T07:53:11.688Z",
        "updatedAt": "2023-06-08T07:53:12.658Z"
    },
    "error": null
}
```

### View unsettled balances
You can now fetch the unsettlted balances of a user by passing the `orgUserId` in the endpoint below.

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
    "orgUserId": "barbara_allen_2",
}
```

In the response, you will see all the users’ unsettleed balances. Along with the invested value, and the value based on current prices. You can use this data to create simple and intuitive portfolio views on your app.

```json
{
    "code": 200,
    "data": [
        {
            "asset": "BTC",
            "quantity": 0.01,
            "currency": "USD",
            "investedValue": 264.34,
            "currentValue": 264.29,
            "returns": -0.04,
            "message": null
        }
    ],
    "error": null
}
```
