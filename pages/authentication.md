---
sidebar_position: 2
---

# Authentication

## Introduction

Calling every endpoint requires the following HEADERS to be set in the request.

- X-API-KEY: This is the api-key that you get from Fuze.
- X-TIMESTAMP: This is the Unix time in seconds (i.e. the number of seconds that have elapsed since 00:00:00 UTC on 1 January 1970, the beginning of the Unix epoch, less adjustments made due to leap seconds).
- X-SIGNATURE: This is the HMAC signature which is a keyed HMAC SHA256 operation. You need to use the api-secret as the key and stringified JSON object containing request body, request params, url slug and X-TIMESTAMP as the payload for the HMAC operation. Please check the section on how to generate this signature.

## Generating the value for X-SIGNATURE request header

HMAC SHA256 signing operation requires two inputs: a key (with which the payload would be signed) and a payload (the value which would be signed using the key).

For generating the X-SIGNATURE value, you would use the api-secret as the key.
The payload (X-SIGNATURE) will be a stringified JSON object where the JSON object would be:

```json
{
  "body": "<request body as JSON object>",
  "query": "<query parameters as key-value fields in a JSON object>",
  "url": "<the url slug for the api endpoint>",
  "ts": "<the value of X-TIMESTAMP header casted to string>"
}
```

Please note that the order of these four fields (viz. "body", "query", "url" & "ts") should be the same as depicted above.

Also note, that the order of body is important for signature generation and verification.

### Examples of different kinds of API requests and corresponding payload structure for generating X-SIGNATURE

<hr/>

#### GET request with no query parameters:

Make a GET call to `https://staging.api.fuze.finance/api/v1/org/`. This does not contain any body or query parameters.

JSON Payload:

```json
{
  "body": {},
  "query": {},
  "url": "/api/v1/org/",
  "ts": "1671444764"
}
```

Note that the value of "ts" is the value of X-TIMESTAMP header that you would pass in the same API call.
You would need to stringify the above JSON Payload before using it as value in the HMAC SHA256 signing operation.

<hr/>

#### GET request with a few query parameters:

Make a GET call to `https://staging.api.fuze.finance/api/v1/org/?k1=v1&k2=v2`. This does not contain any body but has a couple of query parameters.

JSON Payload:

```json
{
  "body": {},
  "query": {
    "k1": "v1",
    "k2": "v2"
  },
  "url": "/api/v1/org/",
  "ts": "1671444764"
}
```

Note that the value of "ts" is the value of X-TIMESTAMP header that you would pass in the same API call.
You would need to stringify the above JSON Payload before using it as value in the HMAC SHA256 signing operation.

<hr/>

#### POST request with a body but no query parameters:

Make a POST call to `https://staging.api.fuze.finance/api/v1/user/`. This contains a body but no query parameters. The body is as follows:

```json
{
  "orgUserId": "ankitshubham97",
  "kyc": false,
  "tnc": true
}
```

JSON Payload:

```json
{
  "body": {
    "orgUserId": "ankitshubham97",
    "kyc": false,
    "tnc": true
  },
  "query": {},
  "url": "/api/v1/user/",
  "ts": "1671444764"
}
```

Note that the value of "ts" is the value of X-TIMESTAMP header that you would pass in the same API call.
The JSON bosy passed in the API request should be exactly matching the one provided in the "body" field of the above JSON payload.
You would need to stringify the above JSON Payload before using it as value in the HMAC SHA256 signing operation.

<hr/>

#### POST request with a body and query parameters:

Make a POST call to `https://staging.api.fuze.finance/api/v1/user/?k1=v1&k2=v2`. This contains a body and a few query parameters. The body is as follows:

```json
{
  "orgUserId": "ankitshubham97",
  "kyc": false,
  "tnc": true
}
```

JSON Payload:

```json
{
  "body": {
    "orgUserId": "ankitshubham97",
    "kyc": false,
    "tnc": true
  },
  "query": {
    "k1": "v1",
    "k2": "v2"
  },
  "url": "/api/v1/user/",
  "ts": "1671444764"
}
```

Note that the value of "ts" is the value of X-TIMESTAMP header that you would pass in the same API call.
The JSON bosy passed in the API request should be exactly matching the one provided in the "body" field of the above JSON payload.
You would need to stringify the above JSON Payload before using it as value in the HMAC SHA256 signing operation.

### Sample code to generate HMAC SHA256 signature from a key and payload

This section shows how you can generate an HMAC SHA256 signature once you have the key and a JSON payload.

We will work with an example of createUser API (POST /api/v1/user/) throughout this section.

PHP Sample code:

```php
<?php
  $API_KEY = "MCowBQYDK2VwAyEA4WzlYqeSEuTIddAOo0VIeaZkjTqp8LUCRZz2qxz7ce4="; // Change this.
  $API_SECRET = "MC4CAQAwBQYDK2VwBCIEIEWY0tGWVuA8HEaXFjzC/AT7T2YP9bcW/nsDYnGkk9ib"; // Change this.
  $orgUserId = "ankitshubham97"; // Might change this.

  $API_ENDPOINT = "https://staging.api.fuze.finance";
  $body = array('orgUserId' => $orgUserId, 'kyc' => True, 'tnc' => True);
  $query = new \stdClass();
  $url = "/api/v1/user/";
  $ts = time() + 3600;

  // Step 1. Following variable 'payload' contains the stringified JSON payload.
  $payload = json_encode(
    array(
      "body" => $body, "query" => $query, "url" => $url, "ts" => strval($ts)
    ), JSON_UNESCAPED_SLASHES
  );

  // Step 2. HMAC SHA256 signature is generated and stored in 'sig' variable.
	$sig = hash_hmac('sha256', $payload, $API_SECRET);
  echo ($sig);

  // Step 3. API call is made via php-curl. Please note the request headers inclusion.
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $API_ENDPOINT.$url);
  curl_setopt( $ch, CURLOPT_POSTFIELDS, json_encode($body) );
  $headers = [
    'Content-Type:application/json',
    'X-API-KEY:'.$API_KEY,
    'X-TIMESTAMP:'.strval($ts),
    'X-SIGNATURE:'.$sig,
  ];
  curl_setopt( $ch, CURLOPT_HTTPHEADER, $headers);
  curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
  $output = curl_exec($ch);
  echo $output;
  curl_close($ch);
?>
```

NodeJS sample code:

```javascript
import axios from "axios";
import { DateTime } from "luxon";
import * as crypto from "node:crypto";

async function main() {
  const API_ENDPOINT = "https://staging.api.fuze.finance";
  const API_KEY =
    "MCowBQYDK2VwAyEA4WzlYqeSEuTIddAOo0VIeaZkjTqp8LUCRZz2qxz7ce4="; //Change this
  const API_SECRET = `MC4CAQAwBQYDK2VwBCIEIEWY0tGWVuA8HEaXFjzC/AT7T2YP9bcW/nsDYnGkk9ib`; // Change this.
  const orgUserId = `ankitshubham97`;
  const body = {
    orgUserId,
    kyc: true,
    tnc: true,
  };
  const query = {};
  const url = `/api/v1/user/`;
  const ts = Math.round(DateTime.utc().toSeconds() + 3600);
  const hmac3 = crypto.createHmac("sha256", API_SECRET);
  hmac3.update(
    JSON.stringify({
      body: body,
      query: query,
      url: `${url}`,
      ts: `${ts}`,
    })
  );
  const signature = hmac3.digest("hex");
  const response = await axios.post(`${API_ENDPOINT}${url}`, body, {
    headers: {
      "X-API-KEY": API_KEY,
      "X-TIMESTAMP": `${ts}`,
      "X-SIGNATURE": signature,
    },
  });
  if (
    !(
      response.status === 200 &&
      response.data?.code === 200 &&
      response.data?.data &&
      !response.data.error
    )
  ) {
    console.error(`Error while calling createUser api`);
    return;
  }
  console.log(`Data response to createUser api: ${response.data}`);
}

main();
```
