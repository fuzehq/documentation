# Websockets

Enhance your trading experience with WebSockets, a high-performance communication protocol, enabling real-time data updates and seamless bidirectional communication for lightning-fast execution and accurate market insights.

## JSON RPC Protocol
We use JSON RPC on our websockets backend, every request is structured as a remote procedure with params and a unique
identifier.

```json
{
  
  "jsonrpc": "2.0",
  "method": "quote_request",
  "params": {
    "symbol": "BTC_USD",
    "type": "RFQ"
  },
  "id": "<uuid>"
}
```

### Authentication
Before you begin requesting quotes from the websockets server, you will have to login with your `API-KEY` and
`API-SECRET`. The following procedure call will authenticate you:

```json
{
  
  "jsonrpc": "2.0",
  "method": "rpc.login",
  "params": {
    "apiKey": "apiKey",
    "apiSecret": "apiSecret"
  },
  "id": "1"
}
```

A successful response will look as follows:
```json
{
  "jsonrpc": "2.0",
  "result": true,
  "id": 1
}
```

A failed login attempt will have following response:
```json
{
  "jsonrpc": "2.0",
  "result": false,
  "id": 1
}
```

### Quote Request
To start a stream of quotes for `BTC_USD`, you can send the following remote procedure call.

```json
{
  
  "jsonrpc": "2.0",
  "method": "quote_request",
  "params": {
    "symbol": "BTC_USD",
    "type": "RFQ"
  },
  "id": "1"
}
```

A successful response will look as follows:
```json
{
  "method": "quote_request",
  "response": {
    "code": 200,
    "data": {
      "symbol": "BTC_USD",
      "buyPrice": 42109.9312493366,
      "sellPrice": 42110.99622133014
    },
    "error": null
  }
}
```


### Market Data Request
To start a stream of market data of all the assets available at Fuze, you can send the following remote procedure call.

```json
{

  "jsonrpc": "2.0",
  "method": "market_data_request",
  "id": "1"
}
```

A successful response will look as follows:
```json
{
  "method": "market_data_request",
  "response": {
    "code": 200,
    "data": {
      "timestamp": 1706792030668,
      "data": [
        {
          "asset": "BTC",
          "policies": {
            "NAME": "Bitcoin",
            "ICON": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
            "ASSET_ENABLE": true,
            "QUOTE_LIMIT": 2000000,
            "LOCAL_CURRENCY": "AED",
            "HIGH_24HR": 155116.31,
            "LOW_24HR": 154042.65,
            "PRICE_CHANGE_PERCENT_24H": -4.5,
            "PRICE_CHANGE_PERCENT_1H": 0.19,
            "PRICE_CHANGE_PERCENT_7D": 5.01,
            "PRICE_CHANGE_PERCENT_30D": -7.23,
            "PRICE_CHANGE_PERCENT_1Y": 82.59,
            "CURRENT_PRICE": 154737.2,
            "MAX_SUPPLY": 21000000,
            "CIRCULATING_SUPPLY": 19614893,
            "ATH": 253608,
            "ATH_DATE": "2021",
            "ATL": 632.31,
            "ATL_DATE": "2015",
            "MARKET_CAP": 3038062006264
          }
        },
        {
          "asset": "ETH",
          "policies": {
            "NAME": "Ethereum",
            "ICON": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
            "ASSET_ENABLE": true,
            "QUOTE_LIMIT": 2000000,
            "LOCAL_CURRENCY": "AED",
            "HIGH_24HR": 8631.48,
            "LOW_24HR": 8226.4,
            "PRICE_CHANGE_PERCENT_24H": -5.45,
            "PRICE_CHANGE_PERCENT_1H": 0.69,
            "PRICE_CHANGE_PERCENT_7D": 1.89,
            "PRICE_CHANGE_PERCENT_30D": -5.11,
            "PRICE_CHANGE_PERCENT_1Y": 43.6,
            "CURRENT_PRICE": 8337.53,
            "MAX_SUPPLY": 0,
            "CIRCULATING_SUPPLY": 120182539.3,
            "ATH": 17918.33,
            "ATH_DATE": "2021",
            "ATL": 1.59,
            "ATL_DATE": "2015",
            "MARKET_CAP": 1002766599030
          }
        },
        {
          "asset": "USDC",
          "policies": {
            "NAME": "Circle USD",
            "ICON": "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
            "ASSET_ENABLE": true,
            "QUOTE_LIMIT": 2000000,
            "LOCAL_CURRENCY": "AED",
            "HIGH_24HR": 3.69,
            "LOW_24HR": 3.65,
            "PRICE_CHANGE_PERCENT_24H": 0.1,
            "PRICE_CHANGE_PERCENT_1H": null,
            "PRICE_CHANGE_PERCENT_7D": 0.07,
            "PRICE_CHANGE_PERCENT_30D": -0.05,
            "PRICE_CHANGE_PERCENT_1Y": -0.04,
            "CURRENT_PRICE": 3.67,
            "MAX_SUPPLY": 0,
            "CIRCULATING_SUPPLY": 26795491945.06,
            "ATH": 4.31,
            "ATH_DATE": "2019",
            "ATL": 3.22,
            "ATL_DATE": "2023",
            "MARKET_CAP": 98435839338
          }
        }
      ]
    },
    "error": null
  }
}
```

### Sample Code
Tying everything together, here is the sample code in typescript for you to connect with websockets server:

```js

import WebSocket from 'ws';

const main = async () => {
  const ws = new WebSocket('wss://staging-ws.api.fuze.finance', {
    headers: {
        'user-agent': 'Mozilla/5.0',
    },
  });
  const apiKey = '';
  const apiSecret = '';
  const id = 1;

  let newId = id;
  ws.on('open', async function open() {
    console.log(`Sending login request with id: ${id}`);

    const message = {
      method: 'rpc.login',
      params: { apiKey, apiSecret },
      jsonrpc: '2.0',
      id: newId,
    };
    ws.send(JSON.stringify(message));

    // sleep for a few seconds

    newId += 1;
    console.log(`Sending quote request with id: ${newId}`);
    const message2 = {
      method: 'quote_request',
      params: { symbol: 'BTC_USD', type: 'RFQ' },
      jsonrpc: '2.0',
      id: newId,
    };
    ws.send(JSON.stringify(message2));

    newId += 1;
    console.log(`Sending market data request with id: ${newId}`);
    const message3 = {
      method: 'market_data_request',
      jsonrpc: '2.0',
      id: newId,
    };
    ws.send(JSON.stringify(message3));
  });

  ws.on('message', function incoming(data) {
    console.log(`Received data: ${data.toString()}`);
  });
};

main();
```

## Limitations
- Websockets feature is only available as part of enterprises offering
