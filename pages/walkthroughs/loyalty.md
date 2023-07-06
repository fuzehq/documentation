# Loyalty
Loyalty APIs by Fuze give you a clean way to reward digital assets in the place of cash backs or loyalty points. In essence, your app can place orders with Fuze the instant you want to give the reward, and users can get tokens at prevailing prices.

The Loyalty Implementation on Fuze has two basic parts:

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

### Reward tokens
You can now reward tokens by making purchases against a given `orgUserId`.

To reward tokens,  you will need to pass the `orgUserId`, along with the `symbol`, `quoteQuantity` and the `operation`. 

- `orgUserId`: orgUserId of the user
- `symbol`: The currency pair you want to trade. 
- `quoteQuantity`: The amount of tokens to buy or sell, expressed in local currency (the quote currency in the currency pair). 
- `operations`: BUY or SELL

So if you want to reward BTC worth 1 USD for barbara_allen_2, you pass the request below:

```bash
POST https://staging.api.fuze.finance/api/v1/loyalty/ HTTP/1.1
X-SIGNATURE: <>
X-TIMESTAMP: <>
X-API-KEY: <>
Content-Type: application/json
User-Agent: PostmanRuntime/7.32.2
Accept: */*
Host: staging.api.fuze.finance
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Content-Length: 75
 
{
"orgUserId": "barbara_allen_2",
"symbol": "BTC_USD",
"operation": "BUY",
"quoteQuantity": 1
}
```

A successful response will contain the final order status, along with the price of the token:

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
        "quantity": 0,
        "quoteQuantity": 0.01,
        "filled": 0.0000373,
        "status": "COMPLETED",
        "rejectionReason": null,
        "createdAt": "2023-06-08T07:53:11.688Z",
        "updatedAt": "2023-06-08T07:53:12.658Z"
    },
    "error": null
}
```

Orders are almost always instant. Nonetheless, you can set up a web hook that will notify you whether the transaction was successful. We’ve covered more details about our web hooks [here](/advanced/webhooks).

Now that we’ve done a transaction, we can once again check the balances of `orgUserId barbara_allen_2`. The balances will be updated to show the last transaction.

```json
{
    "code": 200,
    "data": {
        "balance": [
            {
                "currency": "BTC",
                "value": 0.0000373
            }
        ]
    },
    "error": null
}
```
