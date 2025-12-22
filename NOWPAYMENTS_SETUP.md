# NOWPayments Integration Configuration Guide

## 1. Get Your API Keys from NOWPayments

### Step 1: Create NOWPayments Account
- Visit: https://nowpayments.io
- Sign up for a free account
- Verify your email

### Step 2: Get API Credentials
- Log in to your NOWPayments dashboard
- Go to Settings → API Settings
- Create a new API key
- Copy the **API Key**
- Copy the **IPN Secret** (for webhook verification)

### Step 3: Configure Your Backend

Add these environment variables to your `.env` file:

```env
# NOWPayments Configuration
NOWPAYMENTS_API_KEY=your_api_key_here
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here
BASE_URL=http://localhost:5000
```

### Step 4: Update NOWPayments Webhook Settings

In your NOWPayments Dashboard:
1. Go to Settings → Webhooks
2. Add a new webhook endpoint:
   ```
   https://yourdomain.com/api/payments/webhook
   ```
   (For development: `http://localhost:5000/api/payments/webhook`)
3. Copy the IPN Secret and paste in `.env`

## 2. Supported Cryptocurrencies

NOWPayments supports 200+ cryptocurrencies including:
- Bitcoin (BTC)
- Ethereum (ETH)
- Litecoin (LTC)
- Dogecoin (DOGE)
- Ripple (XRP)
- And many more...

## 3. Payment Statuses

- `waiting` - Waiting for payment
- `confirming` - Payment being confirmed
- `confirmed` - Payment confirmed
- `sending` - Sending funds to merchant
- `finished` - Payment completed
- `failed` - Payment failed
- `expired` - Payment expired
- `refunded` - Payment refunded

## 4. Available Currencies

- USD, EUR, GBP, JPY, and 150+ fiat currencies
- All supported cryptocurrencies

## Complete .env Example

```env
# Server Configuration
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pronext

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# NOWPayments Configuration
NOWPAYMENTS_API_KEY=your_api_key_from_nowpayments_dashboard
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_from_nowpayments_dashboard

# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+14452757954

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

## API Endpoints Reference

### Get Available Currencies
```
GET /api/payments/currencies
```

### Get Price Estimate
```
POST /api/payments/estimate
Content-Type: application/json

{
  "amount": 100,
  "currency_from": "USD",
  "currency_to": "BTC"
}
```

### Create Payment Invoice
```
POST /api/payments/invoice
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "price_amount": 100,
  "price_currency": "USD",
  "pay_currency": "BTC",
  "order_id": "order_12345",
  "order_description": "Premium subscription",
  "customer_email": "user@example.com"
}
```

### Create Payment Order
```
POST /api/payments/order
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "price_amount": 100,
  "price_currency": "USD",
  "pay_currency": "BTC",
  "order_id": "order_12345",
  "order_description": "Premium subscription"
}
```

### Get Payment Status
```
GET /api/payments/status/:paymentId
Authorization: Bearer <jwt_token>
```

### Get Invoice Status
```
GET /api/payments/invoice/:invoiceId
Authorization: Bearer <jwt_token>
```

### Get User Payments
```
GET /api/payments/my-payments?page=1&limit=10
Authorization: Bearer <jwt_token>
```

### Get Minimum Amount
```
GET /api/payments/minimum-amount?from=USD&to=BTC
```

### Get Exchange Rate
```
GET /api/payments/exchange-rate?from=USD&to=BTC
```

### Webhook (IPN Callback)
```
POST /api/payments/webhook
Content-Type: application/json
x-signature: <signature_hash>

{
  "order_id": "order_12345",
  "payment_id": "payment_id",
  "payment_status": "finished",
  "outcome_at": "2024-01-01T12:00:00Z"
}
```

---

## Testing Payment Flow

### 1. Register & Login
```bash
# Register
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fname": "John",
    "lname": "Doe",
    "email": "john@test.com",
    "password": "password123",
    "phone": "9876543210",
    "role": "User"
  }'

# Get OTP from response and verify
curl -X POST http://localhost:5000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "otp": "123456"
  }'

# Save the token from response
TOKEN=eyJhbGciOiJIUzI1NiIs...
```

### 2. Get Available Currencies
```bash
curl http://localhost:5000/api/payments/currencies
```

### 3. Get Price Estimate
```bash
curl -X POST http://localhost:5000/api/payments/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency_from": "USD",
    "currency_to": "BTC"
  }'
```

### 4. Create Payment Invoice
```bash
curl -X POST http://localhost:5000/api/payments/invoice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "price_amount": 100,
    "price_currency": "USD",
    "pay_currency": "BTC",
    "order_id": "order_12345",
    "order_description": "Premium subscription",
    "customer_email": "john@test.com"
  }'
```

### 5. Check Payment Status
```bash
# Replace INVOICE_ID with actual invoice ID from step 4
curl -X GET http://localhost:5000/api/payments/invoice/INVOICE_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Production Deployment

### Before Going Live:

1. **Update BASE_URL** to your production domain
2. **Enable HTTPS** for all payment endpoints
3. **Use Production API Key** from NOWPayments
4. **Add Rate Limiting** on payment endpoints
5. **Implement Logging** for all payment transactions
6. **Set up Monitoring** for failed payments
7. **Test Webhook** thoroughly in production
8. **Add Payment Retry Logic** for failed transactions
9. **Implement Encryption** for sensitive data
10. **Regular Backups** of payment records

---

## Error Handling

Common error scenarios and solutions:

### "NOWPayments API key not configured"
- Solution: Add `NOWPAYMENTS_API_KEY` to `.env`

### "Invalid signature" on webhook
- Solution: Ensure `NOWPAYMENTS_IPN_SECRET` matches your dashboard

### "Payment not found"
- Solution: Verify `order_id` is unique and correctly formatted

### "Insufficient funds at wallet"
- Solution: Ensure customer sends exact amount in crypto

---

## Support

- NOWPayments Docs: https://documenter.getpostman.com/view/7907941/SVfMmyU7
- Email: support@nowpayments.io

---

**Happy Payment Processing!** 🚀💰
