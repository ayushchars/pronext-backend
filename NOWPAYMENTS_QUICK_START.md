# NOWPayments Integration - Quick Start Guide

## ✅ What's Been Integrated

### 1. **Logger-Based Payment Service** (`helpers/nowpaymentsService.js`)
- Centralized NOWPayments API wrapper
- All logging uses the logger class
- Methods for:
  - Creating invoices and payments
  - Checking payment status
  - Getting exchange rates
  - Verifying IPN signatures
  - Fetching available currencies

### 2. **Payment Controller** (`controller/payment/paymentController.js`)
- 13 complete API endpoints
- Integrated logging for all operations
- Automatic database syncing with payments
- Webhook handling for real-time updates
- Admin dashboard statistics

### 3. **Payment Routes** (`controller/payment/payment.js`)
- RESTful endpoints for payments
- Authentication & authorization
- Rate limiting applied
- Admin-only routes

### 4. **Complete Documentation** (`NOWPAYMENTS_SETUP.md`)
- Step-by-step setup instructions
- API endpoint reference
- Testing examples with curl
- Error handling guide
- Production deployment checklist

### 5. **Postman Collection** (`ProNext-NOWPayments-Collection.json`)
- Ready-to-use API requests
- Environment variables for easy testing
- Auto-saving tokens and IDs
- Pre-built test flow

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get API Keys
1. Go to https://nowpayments.io
2. Sign up and verify email
3. Go to Settings → API Settings
4. Copy **API Key** and **IPN Secret**

### Step 2: Update .env File
```env
NOWPAYMENTS_API_KEY=your_key_here
NOWPAYMENTS_IPN_SECRET=your_secret_here
BASE_URL=http://localhost:5000
```

### Step 3: Start Server
```bash
npm run dev
```

### Step 4: Test with Postman
1. Import `ProNext-NOWPayments-Collection.json`
2. Set `base_url` to `http://localhost:5000`
3. Run the "Authentication" folder first
4. Then test payment endpoints

## 📋 API Endpoints (Quick Reference)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/payments/currencies` | ❌ | Get available cryptocurrencies |
| POST | `/api/payments/estimate` | ❌ | Calculate price estimate |
| GET | `/api/payments/exchange-rate` | ❌ | Get exchange rate |
| POST | `/api/payments/invoice` | ✅ | Create payment invoice |
| POST | `/api/payments/order` | ✅ | Create payment order |
| GET | `/api/payments/invoice/:id` | ✅ | Check invoice status |
| GET | `/api/payments/status/:id` | ✅ | Check payment status |
| GET | `/api/payments/my-payments` | ✅ | User payment history |
| POST | `/api/payments/webhook` | 🔒 | NOWPayments webhook (signature verified) |
| GET | `/api/payments/admin/statistics` | 👨‍💼 | Admin payment stats |

## 🔍 Console Logging Examples

When you make a payment request, you'll see detailed logs:

```
[14:35:22] 📝 [PAYMENT_CONTROLLER] [START] Creating payment invoice {orderId: "order_12345"}
[14:35:23] 💰 [NOWPAYMENTS] [START] Creating payment invoice {orderId: "order_12345", amount: 100}
[14:35:24] ✅ [NOWPAYMENTS] Payment invoice created successfully {invoiceId: "inv_123", orderId: "order_12345", paymentUrl: "https://nowpayments.io/..."}
[14:35:24] 💾 [PAYMENT_CONTROLLER] Payment record saved to database
[14:35:24] ✅ [PAYMENT_CONTROLLER] Payment invoice created and saved {invoiceId: "inv_123", orderId: "order_12345"}
```

## 💡 Key Features

### ✨ Automatic Features
- ✅ Auto-sync payment status with database
- ✅ Auto-activate user subscription on payment confirmation
- ✅ Auto-verify webhook signatures for security
- ✅ Auto-save all payment records for audit trail

### 🔐 Security Features
- JWT authentication on protected endpoints
- Admin-only routes for statistics
- IPN signature verification for webhooks
- Rate limiting on all API routes
- Environment variables for secrets

### 📊 Database Integration
- Saves all payment records to MongoDB
- Tracks payment status changes
- Updates user subscription automatically
- Maintains audit trail of all transactions

## 🧪 Test Payment Flow

### 1. Register a User
```bash
POST /api/register
{
  "fname": "John",
  "lname": "Doe",
  "email": "test@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "User"
}
```

### 2. Verify OTP
```bash
POST /api/verify-otp
{
  "email": "test@example.com",
  "otp": "123456"  # From register response
}
```
**Save the `token` from response**

### 3. Create Payment Invoice
```bash
POST /api/payments/invoice
Authorization: Bearer <your_token>
{
  "price_amount": 100,
  "price_currency": "USD",
  "pay_currency": "BTC",
  "order_id": "order_12345",
  "order_description": "Premium Subscription"
}
```

### 4. Check Payment Status
```bash
GET /api/payments/invoice/<invoice_id>
Authorization: Bearer <your_token>
```

## 📁 File Structure

```
controller/
  └── payment/
      ├── paymentController.js  ← 13 endpoints with logging
      └── payment.js             ← Routes configuration

helpers/
  ├── logger.js                  ← Logger class
  └── nowpaymentsService.js      ← NOWPayments API wrapper

models/
  └── paymentModel.js            ← Payment database schema

ProNext-NOWPayments-Collection.json  ← Postman collection
NOWPAYMENTS_SETUP.md                 ← Detailed guide
```

## 🎯 Next Steps

1. **Configure .env** with your NOWPayments API keys
2. **Test locally** using Postman collection
3. **Configure webhook** in NOWPayments dashboard
4. **Deploy to production** (update BASE_URL)
5. **Monitor payments** via admin dashboard

## 🐛 Troubleshooting

### "NOWPayments API key not configured"
- ✅ Add to .env: `NOWPAYMENTS_API_KEY=your_key`

### "Invalid signature on webhook"
- ✅ Ensure `.env` has correct `NOWPAYMENTS_IPN_SECRET`

### "Payment not found in database"
- ✅ Check that order_id is unique
- ✅ Wait for webhook callback (may take a few seconds)

### "401 Unauthorized on payment creation"
- ✅ Pass valid JWT token in `Authorization: Bearer` header

## 📞 Support

- NOWPayments API Docs: https://documenter.getpostman.com/view/7907941/SVfMmyU7
- ProNext Backend Support: Check project documentation

---

## ✨ Summary

You now have a **production-ready NOWPayments integration** with:
- ✅ Complete API endpoints
- ✅ Full logger integration
- ✅ Database persistence
- ✅ Webhook handling
- ✅ Admin dashboard
- ✅ Detailed documentation
- ✅ Postman testing collection

**Everything is ready to go! Start the server and test with Postman.** 🚀💰
