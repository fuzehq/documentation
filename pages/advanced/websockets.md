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
Before you beging requesting quotes from the websockets server, you will have to login with you `API-KEY` and
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

### Sample Code
Tying everything together, here is the sample code in typescript for you to connect with websockets server:

```js

import WebSocket from 'ws';

const main = async () => {
  const ws = new WebSocket('wss://staging-ws.api.fuze.finance');
  const apiKey = '';
  const apiSecret = '';

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
  });

  ws.on('message', function incoming(data) {
    console.log(`Received data: ${data.toString()}`);
  });
};

main();
```


# Limitations

- Websockets feature is only available as part of enterprises offering
