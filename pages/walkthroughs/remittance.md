# Walkthrough: Remittance APIs

The B2B2C Remittance APIs from Fuze is purpose-built for apps and websites that offer remittance products for its customers.


## API Structure
End to end, there are 4 main actions that that comprise a remittance transaction. 

1. **Adding an originator**. Here, originator data is passed to Fuze and an originator is created on Fuze.
2. **Adding beneficiaries against the originator.** Beneficiary data include those related to the beneficiary identity and relationship with originator, and payout data like bank account data. Data to be passed, and validation will therefore differ based on the country + payout type.
3. **Buying local currency.** Before you can make a transfer, you need balances in the local currency. This can be done by generating a quote and buying local currency (AED to INR, for example). This action can be done via Fuze’s dashboard as well. 
4. **Making a transfer.** You can now make a transfer by passing the amount in local currency, along with the beneficiary id(which in turn in mapped to an originator). Funds will be deducted from the local currency purchased in step 3.

### 1. Adding an originator

You can add an originator by passing the mandatory KYC data. In the example below, we’ve created an originator 

```jsx
POST /api/v1/payment/remittance/third-party/create
```

**Body Parameters**

- `name`: Full name of the originator (required)
- `email` : Email address of the originator (required)
- `address`: Address of the originator (required)
- `nationality`: Nationality of the originator (required)
- `country`: Country where the originator is sending funds from / Country in which Id is issued. Country codes will be 2 alphabets (based on the ISO 3166 standard) (required)
- `idType`: Name of ID, for example “EID” (required)
- `idNumber`: ID number collected (required)
- `type`: For the purposes of this product, the type will always be “ORIGINATOR” (required)
- `clientIdentifier`:  A unique identifier for the customer passed by you (required)

The request will look as follows

```jsx
{
  name: 'Nick',
  email: 'nickfury@gmail.com',
  address: '1-A, Baker Street',
  nationality: 'United Kingdom',
  country: 'AE',
  idType: 'EID',
  idNumber: '123456789',
  type: 'ORIGINATOR',
  clientIdentifier: 'NICK123456'
}
```

A successful response will look like this

```jsx
{
  code: 200,
  data: {
    name: 'Nick',
    email: 'nickfury@gmail.com',
    uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f'
    type: 'ORIGINATOR',
    status: 'PENDING',
    clientIdentifier: 'NICK123456'
  },
  error: null
}
```

The final status of the originator - whether Approved (Active) or Rejected - will be passed via webhook. Alternatively, you can also check the status using the endpoint below. 

```jsx
POST /api/v1/payment/remittance/third-party/fetch
```

** Body Parameters **

- `clientIdentifier`:  A unique identifier for the customer passed by you (required)

In case the originator in Active, the response will be as follows. 

```jsx
{
  code: 200,
  data: {
    name: 'Nick',
    email: 'nickfury@gmail.com',
    uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f'
    type: 'ORIGINATOR',
    status: 'ACTIVE',
    clientIdentifier: 'NICK123456'
  },
    error: null
}
```

**Error and rejection scenarios**

- Mandatory data missing
    - In this scenario, the failure would be at the initial creation stage itself, i.e. you’ll receive an error when you try and create the originator
- Rejection reason: AML checks failed
    - This would be in case the originator fails any AML checks on Fuze’s side, if any AML checks are carried out.
- The error code is 400 for the above-mentioned errors.

### 2. Adding a beneficiary

Now that an originator is created, you can create beneficiaries against the originator. The data fields required for a beneficiary vary based on country + payment mode, and will be shared separately. In the example below, the beneficiary added is an Indian bank account. 

```jsx
POST /api/v1/payment/remittance/third-party/account/create
```

**Body Parameters:**

- `thirdPartyClientIdentifier`: The unique identifier used to create the originator, so that the beneficiary can be mapped to them. (required)
- `clientIdentifier`: The unique identifier for the beneficiary (required)
- `currency`: The local currency of the beneficiary (required)
- `accountType`: Type of payout method. A list of payout methods, and respective account data, will shared separately. (required)
- `country`: Country of the beneficiary (required)
- `accountData` : Account data of the beneficiary. This data is validated by Fuze based on the type passed above. In the example below, the bank details for an Indian account are listed:
    - `accountNumber`: Bank account number of the beneficiary (required)
    - `ifscCode` : IFSC code of the bank account (required)
    - `name`: Full name of the beneficiary (required)
    - `relationship`: Relationship between beneficiary and originator. This list can be different for different countries, and will be shared separately. (optional)

The request would be as follows

```jsx
{
	thirdPartyClientIdentifier: 'NICK123456',
  clientIdentifier: 'ACCT123456',
  currency: 'INR',
  accountType: 'BANK',
  country: 'IN',
  accountData: {
    accountNumber: '123456789',
    ifscCode: 'ICIC0000001',
    name: 'Nick Fury'
    relationship: 'FAMILY',
  }
}
```

A successful response will look like this (this will be added in a PENDING state)

```jsx
{
  code: 200,
  data: {
	  uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f',
	  clientIdentifier: 'ACCT123456',
	  status: 'PENDING'
  }
  error: null
}
```

The final status of the beneficiary - whether Verified (Active) or Rejected - will be passed via webhook. Alternatively, you can also check the status using the endpoint below. 

```jsx
POST /api/v1/payment/remittance/third-party/account/fetch
```

**Body Parameters**

- `clientIdentifier`:  A unique identifier for the customer passed by you (required)

In case the beneficiary is verified, the response will be as follows. 

```jsx
{
  code: 200,
  data: {
	  uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f',
	  clientIdentifier: 'ACCT123456',
	  status: 'ACTIVE'
  }
  error: null
}
```

<aside>
💡

In some corridors, it is possible to get data that can help customers verify the payment. Where possible, Fuze can enable an extra state called Pending Verification. The customer can be shown this data (usually the name associated with a bank account) and asked for explicit acceptance. This can help reduce errors around sending funds to the wrong bank account. Do reach out to us for more details.

</aside>

You can delete the beneficiary using the endpoint below 

```jsx
POST /api/v1/payment/remittance/third-party/account/delete/
```

** Body Parameters **

- `clientIdentifier`:  A unique identifier for the customer passed by you (required)

The response will be as follows. 

```jsx
{
  code: 200,
  data: 'SUCCESS',
  error: null
}
```

 **Error and rejection scenarios**

- Mandatory data missing
    - In this scenario, the failure would be at the initial creation stage itself, i.e. you’ll receive an error when you try and add a beneficiary with data missing
- Unable to verify account (wherever possible)
    - If IBAN checks or other such account verification steps carried out indicates that the account is inactive.
- The error code is 400 for the above-mentioned errors. 

### 3. Adding both originator and beneficiary together

You can also do the above two steps through one single API call. The verification for originator and beneficiary will still happen separately, and the statuses for each can be checked via separate endpoints. 

You can add both using the endpoint below 

```jsx
POST /api/v1/payment/remittance/third-party/create-with-account
```

**Body Parameters**

- `name`: Full name of the originator (required)
- `email` : Email address of the originator (required)
- `address`: Address of the originator (required)
- `nationality`: Nationality of the originator (required)
- `country`: Country where the originator is sending funds from / Country in which Id is issued. Country codes will be 2 alphabets (based on the ISO 3166 standard) (required)
- `idType`: Name of ID, for example “EID” (required)
- `idNumber`: ID number collected (required)
- `type`: For the purposes of this product, the type will always be “ORIGINATOR” (required)
- `clientIdentifier`:  A unique identifier for the customer passed by you (required)
- `account`: (This will be an object for details of the beneficiary) (required)
    - `currency`: The local currency of the beneficiary (required)
    - `accountType`: Type of payout method. A list of payout methods, and respective account data, will shared separately. (required)
    - `country`: Country of the beneficiary (required)
    - `clientIdentifier`: The unique identifier for the beneficiary (required)
    - `accountData` : Account data of the customer. This data is validated by Fuze based on the type passed above. In the example below, the bank details for an Indian account are listed:
        - `accountNumber`: Bank account number of the beneficiary (required)
        - `ifscCode` : IFSC code of the bank account (required)
        - `name`: Full name of the beneficiary (required)

The request will look as follows

```jsx
{
	name: 'Nick',
	email: 'nickfury@gmail.com',
	address: '1-A, Baker Street',
	nationality: 'United Kingdom',
	country: 'AE',
	idType: 'EID',
	idNumber: '123456789',
	type: 'ORIGINATOR',
	clientIdentifier: 'NICK123456'
	account: {
	  currency: 'INR',
	  accountType: 'BANK',
	  country: 'IN',
	  clientIdentifier: 'ACCT123456',
	  accountData: {
	    accountNumber: '123456789',
	    ifscCode: 'ICIC0000001',
	    name: 'Nick Fury'
	  }
  }
}
```

A successful response will be as follows 

```jsx
{
  code: 200,
  data: {
    name: 'Nick',
    email: 'nickfury@gmail.com',
    uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f'
    type: 'ORIGINATOR',
    status: 'PENDING',
    clientIdentifier: 'NICK123456'
	  account: {
		  uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f',
		  status: 'PENDING'
		  clientIdentifier: 'ACCT123456'
	  }
  },
  error: null
}
```

- The statuses of the originator and beneficiary can be fetched separately.
- If a beneficiary is pending, you can assume that an originator is verified.
- In case the `clientIdentifier` of the originator already exists in the system, the rest of the data in the thirdParty object, if any, will be ignored. If it doesn’t exist, a new Originator will be created, provided all the mandatory data is passed.

### 4. Buying local currency

To place an order for local currency, you will first need to generate a quote. 

```jsx
POST /api/v1/payment/remittance/quote
```

**Body Parameters**

- `fromCurrency`: The currency you are converting from (required)
- `toCurrency`: The local currency you want to buy (required)
- `quantity`: The amount of currency you want to convert (`fromCurrency`) (required)

The request would be as follows

```jsx
{
  fromCurrency: 'AED',
  toCurrency: 'INR',
  quantity: 100
}
```

In the response, you will get a quote id and an expiry time, as shown below

```jsx
{
	code: 200,
	data: {
	  quoteId: 1,
	  fromCurrency: 'AED',
	  toCurrency: 'INR',
	  quantity: 100,
	  price: 20,
	  expiryTime: 1717332855
	},
	error: null
}
```

The quote id can then be used to place the order, *using the endpoint below.*

```jsx
POST /api/v1/payment/remittance/payment
```

**Body Parameters**

- `quoteId`: The quote id that was created in last api (required)
- `quantity`: The quantity of from currency that was used in last api (required)

The request would be as follows

```jsx
{
  quoteId: 1,
  quantity: 100
}
```

A successful response will look as follows. 

```jsx
{
	code: 200,
	data: {
	  uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f',
	  fromCurrency: 'AED',
	  toCurrency: 'INR',
	  quantity: 100,
	  status: 'PENDING'
	},
	error: null
}
```

You can then fetch the status of the order using the endpoint below

```jsx
POST /api/v1/payment/remittance/payment/fetch
```

** Body Parameters **

- `uuid`: Unique uuid of the payment (required)

If an order is successful, the response will look as follows 

```jsx
{
	code: 200,
	data: {
	  uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f',
	  fromCurrency: 'AED',
	  toCurrency: 'INR',
	  quantity: 100,
	  status: 'SUCCESS'
	},
	error: null
}
```

**Error scenarios** 

- Insufficient funds
    - In case you have insufficient funds to fund the purchase
- Issue with local provider
    - In case the local provider is unable to fulfill the order
- The error code is 400 for the above-mentioned errors. 

**Fetch balance** 

At any given point, you can fetch your current fiat balances using the API below 

```jsx
GET /api/v1/org/balance
```

The response will look as follows

```jsx
{
	code: 200,
	data: {
	  balance: [
		  {
			  currency: 'AED',
			  value: 200
			},
			{
				currency: 'INR',
				value: 100
			}
	  ]
	},
	error: null
}
```

### 5. Transfer funds

To transfer funds, you’ll need to pass the beneficiary uuid, along with the amount in local currency. 

```jsx
POST /api/v1/payment/remittance/payout/create
```

**Body Parameters**

- `currency`: The local currency that needs to be sent (required)
- `amount`: The amount of local currency that needs to be sent (required)
- `clientOrderId` : An idempotency key to avoid duplicate requests (required)
- `clientIdentifier` : The identifier of the beneficiary verified. (required)
- `purpose` : Purpose of transactions between beneficiary and originator (required)

Other data - like purpose codes or source of funds - can also be passed here. Since they vary by country and payment type, Fuze will share the exact text fields separately, as applicable. 

In the example below, a payout for INR 1000 is being initiated 

```jsx
{
  currency: 'INR',
  amount: 1000,
  clientOrderId: 1,
  purpose: 'SALARY'
  clientIdentifier: '21a0194f-709e-4c62-8590-464ddb9abd8f'
}
```

A successful response will be as follows. 

```jsx
{
  code: 200
  data: {
    id: 2
    amount: 1000
    currency: 'INR'
    status: 'PENDING'
    paymentReferenceNumber: ''
    paymentDate: ''
    clientOrderId: '21a0194f-709e-4c62-8590-464ddb9abd8f'
  }
  error: null
}
```

If a transfer is successful, the response will look as follows.

```jsx
{ id: 2
  amount: 1000
  currency: 'INR'
  status: 'SUCCESS'
  paymentReferenceNumber: 'HFC12121111'
  paymentDate: '24-11-2024'
  clientOrderId: '21a0194f-709e-4c62-8590-464ddb9abd8f'
}
```

- The payment reference, payment data and other payout data will differ based on country and/or payment mode. Fuze will share documentation of this data, including what the data fields represent.
- Fee structure will vary based country and transfer channel. Data of fee charged, if any, will be a part of the transfer success response.

**Error and rejection scenarios** 

- Insufficient funds
    - In case you have insufficient funds in the local currenct
- Issue with local partner
    - In case the local partner is unable to process the transaction due to a technical issue
- Issue with account details
    - In case the local partner is unable to process the transfer due to an issue with the payment details given.
- The error code is 400 for the above-mentioned errors. 

In some countries, there can be a variation of a pending state where more data is required for AML reasons, the documentation and process flow for which will be shared separately. 

You can then fetch the status of the payment using the endpoint below

```jsx
POST /api/v1/payment/remittance/payout/list/
```

** Body Parameters **

- `clientIdentifier`: The unique identifier for the beneficiary (required)

A successful response will look as follows 

```jsx
{
    "code": 200,
    "data": [
        {
            "status": "PENDING",
            "currency": "INR",
            "amountDeducted": -10,
            "amountSent": -10,
            "createdAt": "2025-01-22T03:23:27.048Z",
            "referenceId": "Bank-49341737516206",
            "paymentReferenceNumber": "",
            "paymentDate": null,
            "clientOrderId": '21a0194f-709e-4c62-8590-464ddb9abd8f'
        }
    ],
    "error": null
}
```

**Error scenarios** 

- Issue with Bank provider
    - In case the bank is unable to process the transfer
- The error code is 400 for the above-mentioned errors. 

If the transfer is successful, the response will look as follows 

```jsx
{
    "code": 200,
    "data": [
        {
            "status": "COMPLETED",
            "currency": "INR",
            "amountDeducted": -10,
            "amountSent": -10,
            "createdAt": "2025-01-21T12:11:19.190Z",
            "referenceId": "Bank-49341737461478",
            "paymentReferenceNumber": "Bank-49341737461478",
            "paymentDate": "2025-01-21T00:00:00.000Z",
            "clientOrderId": '21a0194f-709e-4c62-8590-464ddb9abd8f'
        }
    ],
    "error": null
}
```

### 6. Webhooks

##### Originator Status #####
To push the latest status of the originator.

**Body Parameters**

- `clientIdentifier`: The identifier of the beneficiary verified.
- `status`: The status of the originator. This can be either `ACTIVE` or `INACTIVE` or `PENDING`

In the example below, an originator was created with the clientIdentifier `21a0194f-709e-4c62-8590-464ddb9abd8f` and the status is `ACTIVE`

```jsx
{
  name: "test"
  email: "test@test.com"
  phoneNumber: ""
  uuid: "0e557e45-05bd-40a1-828f-95444955fc71"
  type: "ORIGINATOR"
  status: "ACTIVE"
  clientIdentifier: "21a0194f-709e-4c62-8590-464ddb9abd8f"
}
```

```jsx
{
  name: "test"
  email: "test@test.com"
  phoneNumber: ""
  uuid: "0e557e45-05bd-40a1-828f-95444955fc71"
  type: "ORIGINATOR"
  status: "INACTIVE"
  clientIdentifier: "21a0194f-709e-4c62-8590-464ddb9abd8f"
  reason: 'Invalid details'       
}
```


##### Thirdparty Status / Beneficiary status #####
To push the latest status of the third party.

**Body Parameters**

- `clientIdentifier`: The identifier of the beneficiary verified.
- `status`: The status of the beneficiary. This can be either `ACTIVE` or `INACTIVE` or `PENDING`

In the example below, an beneficiary was created with the clientIdentifier `21a0194f-709e-4c62-8590-464ddb9abd8f` and the status is `ACTIVE`

```jsx
{
  currency: "INR"
  status: "ACTIVE"
  clientIdentifier: "21a0194f-709e-4c62-8590-464ddb9abd8f"
  createdAt: 1738846398537
  country: "IN"
  accountNumber: "1111111111111111"
  name: "Account name"
  bankCode: "HDFC0002453"
  orgId: "4934"
  uuid: "399bad23-b500-40cb-b07b-502f6d7238d5"
}
```

```jsx
{
  currency: "INR"
  status: "INACTIVE"
  clientIdentifier: "21a0194f-709e-4c62-8590-464ddb9abd8f"
  createdAt: 1738846398537
  country: "IN"
  accountNumber: "1111111111111111"
  name: "Account name"
  bankCode: "HDFC0002453"
  orgId: "4934"
  uuid: "399bad23-b500-40cb-b07b-502f6d7238d5"
  reason: 'Issue with account details'       
}
```

##### Payout Status #####
To push the latest status of the payout.

**Body Parameters**

- `clientOrderId`: The identifier of the order.
- `status`: The status of the payout. This can be either `COMPLETED` or `PENDING` or `CANCELED` or `REVERSED` or `EXPIRED`

In the example below, an order was created with the clientOrderId `12345` and the status is `COMPLETED`

```jsx
{
  id: 2
  amount: 1000
  currency: 'INR'
  status: 'SUCCESS'
  paymentReferenceNumber: 'HFC12121111'
  paymentDate: '24-11-2024'
  clientOrderId: '12345'
}
```
```jsx
{
  id: 2
  amount: 1000
  currency: 'INR'
  status: 'CANCELED'
  paymentReferenceNumber: 'HFC12121111'
  paymentDate: '24-11-2024'
  clientOrderId: '12345'
  reason: 'Insufficient funds'
}
```

```jsx
{
  id: 2
  amount: 1000
  currency: 'INR'
  status: 'REVERSED'
  paymentReferenceNumber: 'HFC12121111'
  paymentDate: '24-11-2024'
  clientOrderId: '12345'
  reason: 'Insufficient funds'
}
```

##### Swap Status #####
To push the latest status of the swap.

**Body Parameters**

- `quoteId`: The identifier of the swap.
- `status`: The status of the swap. This can be either `COMPLETED` or `PENDING` or `CANCELED`

In the example below, a swap was created with the quoteId `1` and the status is `COMPLETED`

```jsx
{
    uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f'
    fromCurrency: 'AED'
    toCurrency: 'INR'
    quantity: 100
    status: 'SUCCESS'
}
```
```jsx
{
  uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f'
  fromCurrency: 'AED'
  toCurrency: 'INR'
  quantity: 100
  status: 'CANCELLED'
}
```


## Error Codes ##
1. **400** - For any other validation errors.
2. **401** - Unauthorized: This is returned when the API key is invalid.
3. **404** - Not Found: This is returned when the requested resource is not found or the endpoint is incorrect.
4. **500** - Internal Server Error: This is returned when there is an issue with the server.
