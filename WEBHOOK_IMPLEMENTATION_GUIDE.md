# 🔔 Webhook Implementation Guide - Payment Detection

## Overview
Webhooks are used to detect successful payments from NOWPayments. When a user completes a payment, NOWPayments immediately calls your webhook to activate the subscription.

---

## ✅ Current Implementation Status

### 1. **Webhook Route** ✓ Configured
- **Endpoint**: `POST /api/payments/webhook`
- **Authentication**: Signature-based (not token-based)
- **File**: [controller/payment/payment.js](controller/payment/payment.js#L43)

```javascript
router.post("/webhook", handleIPNCallback);
```

### 2. **Webhook Handler** ✓ Implemented
- **File**: [controller/payment/paymentController.js](controller/payment/paymentController.js#L374)
- **Function**: `handleIPNCallback()`
- **Purpose**: Process NOWPayments IPN (Instant Payment Notification) callbacks

### 3. **Signature Verification** ✓ Enabled
- **Method**: HMAC-SHA512 signature validation
- **File**: [helpers/nowpaymentsService.js](helpers/nowpaymentsService.js#L303)
- **Secret**: `NOWPAYMENTS_IPN_SECRET` from .env

---

## 🔧 How It Works

### Step-by-Step Payment Detection Flow

```
1. User sends USDT payment
            ↓
2. NOWPayments processes payment (2-5 minutes)
            ↓
3. Payment status → "finished"
            ↓
4. NOWPayments calls webhook
   POST /api/payments/webhook
            ↓
5. Your server receives webhook
            ↓
6. Verify X-Signature header (HMAC-SHA512)
            ↓
7. Find payment record by order_id
            ↓
8. Determine subscription tier by amount
            ↓
9. Update user subscription in database
            ↓
10. Return 200 OK to NOWPayments
            ↓
11. ✅ Subscription ACTIVE for 30 days
```

---

## 📦 Webhook Payload

### What NOWPayments sends to your webhook:

```json
{
  "order_id": "subscription_xyz_Premium_1703300000000",
  "payment_id": "pay_123456789",
  "payment_status": "finished",
  "price_amount": 15,
  "price_currency": "USD",
  "pay_currency": "USDT",
  "outcome_at": "2024-12-23T10:30:45Z",
  "invoice_id": "inv_123456",
  "purchase_id": "purchase_123"
}
```

### Webhook Header:
```
X-Signature: abc123def456...
```
(HMAC-SHA512 signature for authentication)

---

## 🔐 Security Features

### Signature Verification
All webhooks are verified using HMAC-SHA512:

```javascript
// Implementation in nowpaymentsService.js
verifyIPNSignature(data, signature) {
  const crypto = require("crypto");
  const dataString = JSON.stringify(data);
  const hash = crypto
    .createHmac("sha512", this.ipnSecret)
    .update(dataString)
    .digest("hex");
  
  return hash === signature;
}
```

### Environment Configuration Required
Add to your `.env`:
```
NOWPAYMENTS_IPN_SECRET=your_secret_from_nowpayments_dashboard
NOWPAYMENTS_API_KEY=your_api_key
BASE_URL=https://yourdomain.com
```

---

## 💾 Database Updates on Successful Payment

When `payment_status === "finished"`, the webhook automatically updates:

### Payment Record
```javascript
{
  orderId: order_id,
  paymentId: payment_id,
  status: "finished",
  lastUpdated: new Date()
}
```

### User Record (Subscription Activated)
```javascript
{
  subscriptionStatus: true,
  subscriptionTier: "Premium",      // Based on amount
  subscriptionExpiryDate: Date,      // 30 days from now
  lastPaymentDate: new Date(),
  subscriptionActivatedDate: new Date()
}
```

### Subscription Tier Determination
- **< 5 USDT** → Not subscribed (failed payment)
- **5-14 USDT** → **Basic** tier
- **15-29 USDT** → **Premium** tier  
- **≥ 30 USDT** → **Pro** tier

---

## 🧪 Testing Webhooks Locally

### Option 1: Using NOWPayments Sandbox
1. Create account on [sandbox.nowpayments.io](https://sandbox.nowpayments.io)
2. Set webhook URL in dashboard: `https://yourdomain.com/api/payments/webhook`
3. Make test payment
4. Webhook is called automatically

### Option 2: Using ngrok (For Local Development)

```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm start  # Runs on localhost:5000

# In another terminal, expose to internet
ngrok http 5000
# Output: https://abc123.ngrok.io

# Configure webhook URL in NOWPayments dashboard:
# https://abc123.ngrok.io/api/payments/webhook
```

### Option 3: Manual Testing with Postman

Send a test webhook payload:
```
POST http://localhost:5000/api/payments/webhook

Headers:
{
  "Content-Type": "application/json",
  "X-Signature": "your_test_signature"
}

Body:
{
  "order_id": "test_order_123",
  "payment_id": "test_payment_123",
  "payment_status": "finished",
  "price_amount": 15,
  "price_currency": "USD",
  "pay_currency": "USDT",
  "outcome_at": "2024-12-23T10:30:00Z"
}
```

---

## 📊 Payment Status Types

NOWPayments sends different payment statuses:

| Status | Meaning | Action |
|--------|---------|--------|
| `waiting` | Awaiting payment | Subscription NOT activated |
| `confirming` | Payment received, confirming | Subscription NOT activated |
| `confirmed` | Payment confirmed | Subscription MAY activate |
| `finished` | ✅ Payment complete | **Subscription ACTIVATED** |
| `failed` | ❌ Payment failed | Send notification |
| `expired` | ⏱️ Invoice expired | Send notification |

---

## ⚠️ Error Handling

### Invalid Signature
```
Response: 401 Unauthorized - "Invalid signature"
Logs: Warning logged, webhook rejected
```

### Payment Record Not Found
```
Response: 200 OK - "Payment record not found in system"
Reason: Webhook processed but record missing (safe response)
```

### Database Error
```
Response: 200 OK - "Webhook received and queued for processing"
Reason: Returns OK to prevent webhook retries
```

---

## 🔍 Debugging & Monitoring

### Check Webhook Logs
```bash
# Terminal output shows webhook processing
[PAYMENTS] ✅ SUBSCRIPTION ACTIVATED VIA WEBHOOK
{
  "userId": "user_123",
  "email": "user@example.com",
  "orderId": "subscription_xyz_Premium_1703300000000",
  "paymentId": "pay_123456789",
  "tier": "Premium",
  "amount": 15,
  "currency": "USDT"
}
```

### Verify Payment in Database
```javascript
// Check payment record
db.payments.findOne({ orderId: "subscription_xyz_Premium_1703300000000" })
// Should show: status: "finished", paymentId: "pay_123456789"

// Check user subscription
db.users.findOne({ email: "user@example.com" })
// Should show: subscriptionStatus: true, subscriptionTier: "Premium"
```

### Test Webhook Retry
NOWPayments retries webhooks if server returns non-2xx status. Always return 200 OK.

---

## 🚀 Configuration Checklist

- [ ] `.env` has `NOWPAYMENTS_IPN_SECRET`
- [ ] `.env` has `NOWPAYMENTS_API_KEY`
- [ ] `.env` has `BASE_URL` (for webhook URL construction)
- [ ] Webhook URL configured in NOWPayments dashboard
- [ ] Server is publicly accessible (ngrok for local dev)
- [ ] Payment model has `orderId`, `paymentId`, `status` fields
- [ ] User model has `subscriptionStatus`, `subscriptionTier`, `subscriptionExpiryDate` fields
- [ ] Test payment completes successfully
- [ ] Webhook logs show payment detected
- [ ] Database shows subscription activated

---

## 📞 Troubleshooting

### "Invalid signature on webhook"
- ✅ Ensure `NOWPAYMENTS_IPN_SECRET` matches NOWPayments dashboard
- ✅ Check signature verification code in `nowpaymentsService.js`
- ✅ Verify webhook payload is not modified

### "Webhook not being called"
- ✅ Check NOWPayments dashboard for webhook URL configuration
- ✅ Ensure server is publicly accessible (use ngrok for local)
- ✅ Check firewall/network allows incoming POST requests
- ✅ Test with NOWPayments sandbox first

### "Subscription not activating"
- ✅ Check logs for webhook receipt
- ✅ Verify payment status is "finished"
- ✅ Confirm user exists in database
- ✅ Check `subscriptionStatus` and `subscriptionTier` are updating

### "Webhook timeout"
- ✅ Ensure handler responds within 30 seconds
- ✅ Don't make long-running operations in webhook handler
- ✅ Use async background jobs for email/notifications

---

## 📚 Related Files

- **Route**: [controller/payment/payment.js](controller/payment/payment.js)
- **Handler**: [controller/payment/paymentController.js](controller/payment/paymentController.js)
- **Service**: [helpers/nowpaymentsService.js](helpers/nowpaymentsService.js)
- **Models**: [models/paymentModel.js](models/paymentModel.js), [models/authModel.js](models/authModel.js)
- **Testing**: [SUBSCRIPTION_TESTING.md](SUBSCRIPTION_TESTING.md), [SUBSCRIPTION_WORKFLOW.md](SUBSCRIPTION_WORKFLOW.md)

---

## 🎯 Next Steps

1. ✅ **Verify Configuration**: Check `.env` has IPN secret
2. ✅ **Test Webhook Handler**: Use Postman to send test payload
3. ✅ **Configure NOWPayments Dashboard**: Set webhook URL
4. ✅ **Test with Real Payment**: Complete test subscription
5. ✅ **Monitor Logs**: Verify webhook is being called
6. ✅ **Check Database**: Confirm subscription activated

---

## 📝 Notes

- Webhooks are called by NOWPayments, not initiated by your server
- Always return 200 OK to prevent retry loops
- Signature verification is mandatory for security
- Subscription tier is auto-determined by payment amount
- Expiry date is automatically set to 30 days from activation
- Email notifications can be added to handler TODO comments
