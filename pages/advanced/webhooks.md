# Webhooks

Webhooks are mechanisms to notify your application whenever an event occurs which relates to your account associated with Fuze. Webhooks are particularly useful for asynchronous events like when your customer places an order or when a customer makes a trade. After configuring the webhooks, you get notified of the supported events in real time.

# Setting up a webhook

## Creating a webhook endpoint

### Choose an HTTP server

You'll need an HTTP server to host your webhook endpoint. The assumption is that you already have some kind of http server running. If not, some popular options include Apache, Nginx, and Node.js built-in HTTP server. The HTTP server, on which you will be creating the webhook endpoint, should be accessible via the internet and accessible at a URL. For the sake of this guide, let’s assume the http server is accessible at https://dunmorehigh.com.

Note: The URL of the server should be a `subdomain` of the `domain` you registered in your KYC docs to enforce security.

### Create a new HTTP server endpoint

Create a new route in your web framework that will handle incoming webhook requests. For example, if you're using Node.js and Express.js, you could create a new route like this:

```jsx
app.post('/webhook', (req, res) => {
  // Handle incoming webhook request here
})
```

This means that the webhook endpoint created is https://dunmorehigh.com/webhook. Fuze would send all the events on this endpoint once the registration of the webhook is done.

## Registering the webhook endpoint

### Challenge handling

It ensures that you are registering the intended endpoint as the webhook endpoint. In challenge-handling step, Fuze sends a challenge string in the body. The HTTP request signature could look something like this:

```bash
POST /webhook HTTP/1.1

Host: dunmorehigh.com
fuze-signature: 1c528260457716abaf4e1ede0cdc7469bdcc42bc21b48acb21aed1837f7fe53d
fuze-timestamp: 1678486009825
Content-Type: application/json
Content-Length: 47

{
    "challenge": "randomly-generated-value"
}
```

Your server should be able to respond back with the challenge value in the response body. For example, if you're using Node.js and Express.js, you could handle like this:

```tsx
app.post('/webhook', (req, res) => {
	if (req.body?.challenge) {
    res.send(req.body.challenge);
    return;
  }
  // Handle the incoming webhook events here
})
```

### Webhook secret (Frontend)

You would also need to choose a strong string as webhook secret. This will enable us to ensuring webhook security.

# Handling events from a webhook

## Webhook security

We recommend using webhook signatures to verify that Fuze generated a webhook request and that it didn’t come from a server acting like Fuze.

For every webhook request sent to your webhook endpoint, there would be mandatorily two headers:

- fuze-signature
- fuze-timestamp

fuze-timestamp is just the number of milliseconds elapsed since midnight, January 1, 1970 Universal Coordinated Time (UTC) also popularly called as epoch timestamp. You should verify that the value is not too old or in future.

Fuze signs the webhook events (more precisely, it signs an object containing the request body, fuze-timestamp request header and the webhook secret) it sends to your endpoints by including a signature in each event’s fuze-signature header. This allows you to verify that the events were sent by Fuze and not by a third party. You can verify signatures manually by following our guide.

Before you can verify signatures, you need to retrieve your endpoint’s secret from your Dashboard’s Webhooks settings. Select an endpoint that you want to obtain the secret for, then click the Click to reveal button.

### Guide (NodeJS) to verify signature:

The idea to verify the signature is simple:

Get hold of the fuze-timestamp header, fuze-signature header and request body from the incoming webhook request. Also, get hold of the webhook secret that you have set earlier. As hinted earlier, Fuze signs an object containing the request body, fuze-timestamp request header and the webhook secret and the resulting signature is sent as fuze-signature in the request header. So, you just need to recalculate the signature and match it with fuze-signature!

Following function takes request body, fuze-timestamp request header and the webhook secret as arguments and calculates the signature using the same algorithm that Fuze uses (Fuze generates signatures using a hash-based message authentication code (HMAC) with SHA-256).

```tsx
import * as crypto from 'node:crypto';

export const generateFuzeWebhookSignature = ({
  payload,
  timestamp,
  secret,
}: {
  payload: unknown;
  timestamp: number;
  secret: string;
}) => {
  const hmac = crypto.createHmac('sha256', secret);
  const hmacPayload = JSON.stringify({
    payload,
    timestamp,
  });
  hmac.update(hmacPayload);
  return hmac.digest('hex');
};
```

In the route code, you need to call the above method and check if the signatures match:

```tsx
app.post('/webhook', (req, res) => {
	if (req.body?.challenge) {
    res.send(req.body.challenge);
    return;
  }
  const signature = generateFuzeWebhookSignature({
    payload: req.body,
    timestamp: Number(req.header('fuze-timestamp')),
    secret: 'put-your-secret-here',
  });
  if (signature !== req.header('fuze-signature')) {
    // Signatures don't match!
    console.log('PANIC: Signatures do not match');
    res.status(400).send();
  }
  // Handle the incoming webhook events here
})
```

## Receiving events

Fuze will send data on the webhook endpoint strictly as a REST API call with:

- method as POST
- content-type as application/json
- data in the request body

Your server would need to respond with a status 200 to let the Fuze server know that you have received the event well. Otherwise, Fuze will retry to send the events as per the retry policy.

```tsx
app.post('/webhook', (req, res) => {
	if (req.body?.challenge) {
    res.send(req.body.challenge);
    return;
  }
  const signature = generateFuzeWebhookSignature({
    payload: req.body,
    timestamp: Number(req.header('fuze-timestamp')),
    secret: 'put-your-secret-here',
  });
  if (signature !== req.header('fuze-signature')) {
    // Signatures don't match!
    console.log('PANIC: Signatures do not match');
    res.status(400).send();
  }
  const data = req.body;

  // Handle the incoming webhook events here.
  handleWebhookEvent(data);

  // Send a 200 status.
  res.send();
})
```

## Retry policy

As of writing this doc, it is as follows:

1. Fuze expects a 200 response to the webhook request sent. If not, it retries at maximum 3 times sending the same event.
2. If it fails to send even after 3 times, it sends an email to the support emails of your organisation.

## Sample Events

Order Event:
```json
{
  "event": {
    "orgId": 10,
    "entity": "Orders",
    "numRetries": 0,
    "updatedAt": 2023-12-14T12:35:02.894Z,
    "createdAt": 2023-12-14T12:35:02.894Z
  },
  "data": {
    "id": 29718,
    "orgId": 10,
    "clientOrderId": "5468bbb7-5e5f-425c-a6eb-b89e19a0298a",
    "orgUserId": "barbara_allen",
    "symbol": "ETH_AED",
    "price": 0,
    "averagePrice": 8456.1,
    "side": "BUY",
    "type": "MARKET",
    "quantity": 0.01,
    "quoteQuantity": 0,
    "filled": 0.01,
    "status": "COMPLETED",
    "rejectionReason": null,
    "createdAt": 2023-12-14T12:25:00.257Z,
    "updatedAt": 2023-12-14T12:25:02.529Z
  }
}
```

Crypto Balance Update Event:
```json
{
  "event": {
    "orgId": 10,
    "entity": "LedgerTxns",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "orgId": 10,
    "amount": 0.01,
    "currency": "ETH",
    "txnId": "20434"
  }
}
```

Bank Transfer Event:
```json
{
  "event": {
    "orgId": 10,
    "entity": "BankTransfers",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "orgId": 10,
    "status": "APPROVED",
    "type": "DEPOSIT",
    "fundingCurrency": "AED",
    "referenceId": "uuid1",
    "totalTradeAmount": 10000
  }
}
```

Policy Action Update Event:
```json
{
  "event": {
    "orgId": 10,
    "entity": "Actions",
    "numRetries": 0,
    "updatedAt": "2023-12-14T12:35:02.894Z",
    "createdAt": "2023-12-14T12:35:02.894Z"
  },
  "data": {
    "name": "QUOTE_LIMIT",
    "oldValue": {
    },
    "newValues": {
      "BTC": 1000,
      "ETH": 100
    }
  }
}
```

## Limitations
- Webhook feature is only available as part of enterprises offering
- You cannot subscribe to a subset of events.
- There is a timeout (currently set to 1s) on the webhook response from the customer’s backend. If a 200-status response does not arrive till then, Fuze assumes that the delivery failed.
