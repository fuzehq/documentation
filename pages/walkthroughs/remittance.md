The B2B2C Remittance APIs from Fuze is purpose-built for apps and websites that offer remittance products for its customers. End to end, there are 4 main actions that that comprise a remittance transaction. 

1. **Adding an originator**. Here, an originator data is passed to Fuze and an originator is created on Fuze.
2. **Adding beneficiaries against the originator.** Beneficiary data include those related to the beneficiary identity and relationship with originator, and payout data like bank account data. Data to be passed, and validation will therefore differ based on the country + payout type.
3. **Buying local currency.** Before you can make a transfer, you need to balances in the local currency. This can be done by generating a quote and buying local currency (AED to INR, for example). This action can be done via Fuze’s dashboard as well. 
4. **Making a transfer.** You can now make a transfer by passing the amount in local currency, along with the beneficiary id(which in turn in mapped to an originator). Funds will be deducted from the local currency purchased in step 3. 

### 1. Adding an originator

You can add an originator by passing the mandatory KYC data. In the example below, we’ve created an originator 

```jsx
POST /api/v1/payment/remittance/third-party/create
```

**Body Parameters**

- `name`: Full name of the originator
- `email` : Email address of the originator
- `address`: Address of the originator
- `nationality`: Nationality of the originator
- `country`: Country where the originator is sending funds from / Country in which Id is issued. Country codes will be 2 alphabets (based on the ISO 3166 standard)
- `idType`: Name of ID, for example “EID”
- `idNumber`: ID number collected
- `type`: For the purposes of this product, the type will always be “ORIGINATOR”
- `clientIdentifier`:  A unique identifier for the customer passed by you

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
GET /api/v1/payment/remittance/third-party/${clientIdentifier}
```

In case the originator in Active, the response will be as follows. 

```jsx
  data: {
    name: 'Nick',
    email: 'nickfury@gmail.com',
    uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f'
    type: 'ORIGINATOR',
    status: 'ACTIVE',
    clientIdentifier: 'NICK123456'
  },
```

Error and rejection scenarios

- Mandatory data missing
    - In this scenario, the failure would be at the initial creation stage itself, i.e. you’ll receive an error when you try and create the originator
- Rejection reason: AML checks failed
    - This would be in case the originator fails any AML checks on Fuze’s side, if any AML checks are carried out.

### 2. Adding a beneficiary

Now that an originator is created, you can create beneficiaries against the originator. The data fields required for a beneficiary vary based on country + payment mode, and will be shared separately. In the example below, the beneficiary added is an Indian bank account. 

```jsx
POST /api/v1/payment/remittance/third-party/create-account
```

**Body Parameters:**

- `clientIdentifier`: The unique identifier used to create the originator, so that the beneficiary can be mapped to them.
- `currency`: The local currency of the beneficiary
- `type`: Type of payout method. A list of payout methods, and respective account data, will shared separately.
- `country`: Country of the beneficiary
- `accountData` : Account data of the customer. This data is validated by Fuze based on the type passed above. In the example below, the bank details for an Indian account are listed:
    - `accountNumber`: Bank account number of the beneficiary
    - `ifscCode` : IFSC code of the bank account
    - `name`: Full name of the beneficiary
    - `relationship`: Relationship between beneficiary and originator. This list can be different for different countries, and will be shared separately.

The request would be as follows

```jsx
{
  clientIdentifier: 'NICK123456',
  currency: 'INR',
  type: 'BANK',
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
	  status: 'PENDING'
  }
  error: null
}
```

The final status of the beneficiary - whether Verified (Active) or Rejected - will be passed via webhook. Alternatively, you can also check the status using the endpoint below. 

```jsx
GET /api/v1/payment/remittance/third-party/account/${uuid}
```

In case the beneficiary is verified, the response will be as follows. 

```jsx
{
  uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f',
	status: 'ACTIVE'
}
```

<aside>
💡

In some corridors, it is possible to get data that can help customers verify the payment. Where possible, Fuze can enable an extra state called Pending Verification. The customer can be shown this data (usually the name associated with a bank account) and asked for explicit acceptance. This can help reduce errors around sending funds to the wrong bank account. Do reach out to us for more details.

</aside>

You can delete the beneficiary using the endpoint below 

```jsx
POST /api/v1/payment/remittance/third-party/delete-account/
```

**Body Parameters** 

- `uuid`: The uuid passed by Fuze once a beneficiary is created.

The request would be as follows

```jsx
{
  uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f',
}
```

 **Error and rejection scenarios**

- Mandatory data missing
    - In this scenario, the failure would be at the initial creation stage itself, i.e. you’ll receive an error when you try and add a beneficiary with data missing
- Unable to verify account (wherever possible)
    - If IBAN checks or other such account verification steps carried out indicates that the account is inactive.

### 3. Buying local currency

To place an order for local currency, you will first need to generate a quote. 

```jsx
POST /api/v1/payment/remittance/quote
```

**Body Parameters**

`fromCurrency`: The currency you are converting from

`toCurrency`: The local currency you want to buy

`quantity`: The amount of currency you want to convert (`fromCurrency`)

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

The quote id can then be used to place the order

POST /api/v1/payment/remittance/payment

Body Parameters:

- `quoteId`: The quote id that was created in last api
- `quantity`: The quantity of from currency that was used in last api

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
	  id: 10,
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
GET /api/v1/payment/remittance/payment/${paymentId}
```

If an order is successful, the response will look as follows 

```jsx
{
	code: 200,
	data: {
	  id: 10,
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

### 4. Transfer funds

To transfer funds, you’ll need to pass the beneficiary uuid, along with the amount in local currency. 

```jsx
POST /api/v1/payment/remittance/payout/create
```

**Body Parameters**

`currency`: The local currency that needs to be sent

`amount`: The amount of local currency that needs to be sent

`clientOrderId`: An idempotency key to avoid duplicate requests 

`uuid`: The identifier of the beneficiary created earlier.

`purpose`: Purpose of transactions between beneficiary and originator

Other data - like purpose codes or source of funds - can also be passed here. Since they vary by country and payment type, Fuze will share the exact text fields separately, as applicable. 

In the example below, a payout for INR 1000 is being initiated 

```jsx
{
  currency: 'INR',
  amount: 1000,
  clientOrderId: 1,
  purpose: 'SALARY'
  uuid: '21a0194f-709e-4c62-8590-464ddb9abd8f'
}
```

A successful response will be as follows. 

```jsx
{
  code: 200,
  data: {
    id: 2,
    amount: 1000,
    currency: 'INR',
    status: 'PENDING'
  },
  error: null
}
```

If a transfer is successful, the response will look as follows.

```jsx
{
	id: 2,
	amount: 1000,
  currency: 'INR',
  status: 'SUCCESS'
  paymentReferenceNumber: 'HFC12121111'
  paymentDate: '24-11-2024'
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

In some countries, there can be a variation of a pending state where more data is required for AML reasons, the documentation and process flow for which will be shared separately.