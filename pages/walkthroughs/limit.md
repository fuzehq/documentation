# Limit Orders
Limit Order APIs by Fuze offer you a simple and straightforward way to create a digital asset order book experience for your users. As you’ll see, you can deploy a fully-functional order book app using just 4 API requests.

There is no call to fetch the orderbook depth as the orderbook provided by us is a dark venue to facilitate large transactions.

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

### Place an order
You can now place orders against the `orgUserId` we just created.

To place an order,  you will need to pass the `orgUserId`, along with the `symbol`, `quantity`, `price`, `type` and the `operation`

- `orgUserId`: The user.
- `symbol`: The currency pair you want to trade.
- `quantity`: The amount of asset to buy or sell.
- `price`: The limit price for the asset.
- `type`: `LIMIT` for limit orders.
- `operations`: BUY or SELL
- `clientOrderId`: Optional idempotency key which ensures the same order is not placed twice.

So if you want to buy 0.01 BTC at a price lower than equal to 5000 for barbara_allen_2, you pass the request below:

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
    "quantity": 0.01
    "price": 5000,
    "type": "LIMIT",
    "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a",
}
```

A successful response will contain an `id` which can be used to query the status of the order later.

```json
{
    "code": 200,
    "data": {
        "id": 107,
        "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a",
        "orgId": 28,
        "orgUserId": "barbara_allen_2",
        "symbol": "BTC_USD",
        "side": "BUY",
        "quantity": 0.01,
        "price": 5000,
        "type": "LIMIT",
        "rejectionReason": null,
        "filled": 0
    },
    "error": null
}
```

Limit Orders will be executed when a corresponding match is found. You can set up a web hook that will notify you about order lifecycle events like `OPEN`, `COMPLETED`, `REJECTED` and partial fills. We’ve covered more details about our web hooks [here](/advanced/webhooks).

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
        "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a",
        "orgId": 28,
        "orgUserId": "barbara_allen_2",
        "symbol": "BTC_USD",
        "price": 5000,
        "averagePrice": 26749.08,
        "side": "BUY",
        "quantity": 0.01,
        "quoteQuantity": 0,
        "filled": 0.005,
        "status": "OPEN",
        "rejectionReason": null,
        "createdAt": "2023-06-08T07:53:11.688Z",
        "updatedAt": "2023-06-08T07:53:12.658Z"
    },
    "error": null
}
```

### Cancel Order
Limit Orders are placed with a `GOOD_TILL_CANCEL` flag. You can request the cancellation of an order to ensure it not
longer is considered for further matching using the below API.

```bash
POST https://staging.api.fuze.finance/api/v1/trading/cancel HTTP/1.1
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
        "orgUserId": "barbara_allen_2",
        "orderId": 107
    },
    "error": null
}
```

```json
{
    "code": 200,
    "data": {
        "id": 107,
        "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a",
        "orgId": 28,
        "orgUserId": "barbara_allen_2",
        "symbol": "BTC_USD",
        "price": 5000,
        "averagePrice": 26749.08,
        "side": "BUY",
        "quantity": 0.01,
        "quoteQuantity": 0,
        "filled": 0.005,
        "status": "CANCELLED",
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
POST https://staging.api.fuze.finance/api/v1/trading/orders/ HTTP/1.1
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
            "quantity": 0.01,
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
