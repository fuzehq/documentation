# OTC (Over The Counter)
OTC API by Fuze offer you a simple and straightforward way to trade `blocks` using an `RFQ` mechanism.

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
        "userStatus": "ACTIVE",
        "firstName": "",
        "lastName": ""
    },
    "error": null
}
```

You can also check balances of this `barbara_allen_2` using the endpoint below.
```bash
GET https://staging.api.fuze.finance/api/v1/user/balance/?orgUserId=barbara_allen_2 HTTP/1.1
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

### Place an order
You can now place orders against the `orgUserId` we just created.

To place an order,  you will need to pass the `orgUserId`, along with the `symbol`, `quoteQuantity` and the `operation`. Unlike a normal trading order, you also required a `quoteId` which expires every `5 seconds`.

- `orgUserId`: The user.
- `symbol`: The currency pair you want to trade. 
- `quoteQuantity`: The amount of tokens to buy or sell, expressed in local currency (the quote currency in the currency pair). 
- `operations`: BUY or SELL
- `quoteId`: generate using `generateQuote` API.

So if you want to buy BTC worth 0.01 USD for barbara_allen_2, you pass the request below:

```bash
POST https://staging.api.fuze.finance/api/v1/otc/quote/ HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
Content-Type: application/json
User-Agent: PostmanRuntime/7.32.3
Accept: */*
Postman-Token: b6d93a55-ea08-427d-9b2a-e93c4007d8d0
Host: dev.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Content-Length: 73
 
{
  "orgUserId": "barbara_allen_2",
  "symbol": "BTC_USD",
  "quantity": 0.01,
  "operation": "BUY"
}

```
A successful response will contain an `id` which is the `quoteId` that needs to be passed to the `placeOtcOrder` API
call.

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

```bash
POST https://staging.api.fuze.finance/api/v1/otc/ HTTP/1.1
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
  "quoteQuantity": 0.01
  "quoteId": 591,
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
        "quantity": 0,
        "quoteQuantity": 1,
        "rejectionReason": null,
        "filled": 0
    },
    "error": null
}
```

Orders are almost always instant. Nonetheless, you can set up a web hook that will notify you whether the transaction was successful. We’ve covered more details about our web hooks [here](/advanced/webhooks).

To check the status of the order, using REST, use the `id` obtained while creating the order:

```bash
GET https://staging.api.fuze.finance/api/v1/otc/orders/107 HTTP/1.1
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
        "averagePrice": 26749.08,
        "side": "BUY",
        "quantity": 0.01,
        "quoteQuantity": 0,
        "filled": 0.01,
        "status": "COMPLETED",
        "rejectionReason": null,
        "createdAt": "2023-06-08T07:53:11.688Z",
        "updatedAt": "2023-06-08T07:53:12.658Z"
    },
    "error": null
}
```

### View Portfolio
You can now fetch the current holdings of a user by passing the `orgUserId` in the endpoint below.

```bash
GET https://staging.api.fuze.finance/api/v1/user/holdings/?orgUserId=barbara_allen_2 HTTP/1.1
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

In the response, you will see all the users’ holdings. Along with the invested value, and the value based on current prices. You can use this data to create simple and intuitive portfolio views on your app.

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

### View Transaction History
You can also fetch individual transaction details by passing the `orgUserId` in the endpoint below.

```bash
GET https://staging.api.fuze.finance/api/v1/otc/orders/?orgUserId=barbara_allen_2 HTTP/1.1
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

In the response, you will get a list of all transactions made by a user. You can use this data to create a transaction history view for your users.

```json
{
    "code": 200,
    "data": [
        {
            "id": 105,
            "orgId": 28,
            "orgUserId": "barbara_allen_2",
            "symbol": "ETH_USD",
            "price": 0,
            "averagePrice": 0,
            "side": "BUY",
            "quantity": 0,
            "quoteQuantity": 1,
            "filled": 0,
            "status": "REJECTED",
            "rejectionReason": "ETH is disabled for trading",
            "createdAt": "2023-06-08T07:51:32.051Z",
            "updatedAt": "2023-06-08T07:51:32.447Z"
        },
        {
            "id": 107,
            "orgId": 28,
            "orgUserId": "barbara_allen_2",
            "symbol": "BTC_USD",
            "price": 0,
            "averagePrice": 26749.08,
            "side": "BUY",
            "quantity": 0.01,
            "quoteQuantity": 0,
            "filled": 0.01,
            "status": "COMPLETED",
            "rejectionReason": null,
            "createdAt": "2023-06-08T07:53:11.688Z",
            "updatedAt": "2023-06-08T07:53:12.658Z"
        }
    ],
    "error": null
}
```
