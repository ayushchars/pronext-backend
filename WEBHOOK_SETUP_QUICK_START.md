# 🔧 Webhook Setup Instructions

## Quick Setup (5 minutes)

### Step 1: Configure Environment Variables

Add to your `.env` file:
```bash
# NOWPayments Configuration
NOWPAYMENTS_API_KEY=your_api_key_here
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here

# Server Configuration
BASE_URL=https://yourdomain.com  # Or http://localhost:5000 for local
PORT=5000
```

### Step 2: Get IPN Secret from NOWPayments

1. Log in to [https://nowpayments.io/dashboard](https://nowpayments.io/dashboard)
2. Go to **Settings** → **API Settings**
3. Find **IPN Secret** (or generate one)
4. Copy and paste into `.env` as `NOWPAYMENTS_IPN_SECRET`

### Step 3: Configure Webhook URL

**In NOWPayments Dashboard:**
1. Go to **Settings** → **Webhooks**
2. Set Webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: **Payment Confirmed** or **Payment Finished**
4. Save

**For Local Development with ngrok:**
```bash
# Terminal 1: Start your server
npm start

# Terminal 2: Expose with ngrok
ngrok http 5000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Set webhook URL: https://abc123.ngrok.io/api/payments/webhook
```

### Step 4: Test the Setup

```bash
# Send a test webhook (replace with actual values)
curl -X POST http://localhost:5000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: test_signature" \
  -d '{
    "order_id": "test_order_123",
    "payment_id": "test_payment_123",
    "payment_status": "finished",
    "price_amount": 15,
    "price_currency": "USD",
    "pay_currency": "USDT",
    "outcome_at": "2024-12-23T10:30:00Z"
  }'
```

---

## Production Checklist

- [ ] `.env` has correct `NOWPAYMENTS_IPN_SECRET`
- [ ] `.env` has correct `NOWPAYMENTS_API_KEY`
- [ ] `.env` `BASE_URL` points to your domain
- [ ] NOWPayments webhook URL configured correctly
- [ ] Server has public IP/domain (not localhost)
- [ ] HTTPS enabled (NOWPayments requires HTTPS)
- [ ] Firewall allows incoming POST to `/api/payments/webhook`
- [ ] Test payment completed successfully
- [ ] Check server logs for webhook receipt
- [ ] Database shows subscription activated

---

## Testing Payment Flow

### Using Postman Collection

1. Import **ProNext-NOWPayments-Collection.json**
2. Run: **Register User** → **Verify OTP** → **Subscribe**
3. Wait for payment confirmation (2-5 minutes)
4. Check logs for webhook: `✅ SUBSCRIPTION ACTIVATED VIA WEBHOOK`
5. Verify database shows subscription active

### Using NOWPayments Sandbox

1. Create account on [sandbox.nowpayments.io](https://sandbox.nowpayments.io)
2. Configure webhook in sandbox dashboard
3. Make test payment with sandbox USDT
4. Webhook should be called immediately in sandbox

---

## Webhook Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Webhook processed successfully |
| 401 | Unauthorized | Invalid signature |
| 500 | Error | Server error (retry will be attempted) |

**Always return 200 OK** unless signature is invalid. NOWPayments retries on non-2xx responses.

---

## Common Issues & Solutions

### Issue: "Invalid signature"
```
Solution: 
1. Verify NOWPAYMENTS_IPN_SECRET in .env matches dashboard
2. Check signature verification code
3. Ensure webhook payload is not being modified
```

### Issue: "Webhook not called"
```
Solution:
1. Check NOWPayments dashboard webhook configuration
2. Verify server is publicly accessible
3. Use ngrok for local development
4. Check firewall allows POST requests
5. Test with sandbox first
```

### Issue: "Subscription not activating"
```
Solution:
1. Check server logs for "SUBSCRIPTION ACTIVATED"
2. Verify payment status is "finished"
3. Confirm user exists in database
4. Check database for subscription status update
5. Verify payment amount matches tier (5/15/30 USDT)
```

---

## Monitoring Webhooks

### Check Logs
```bash
# Watch for webhook logs in real-time
tail -f logs/*.log | grep -i webhook

# Or search for successful payments
tail -f logs/*.log | grep "SUBSCRIPTION ACTIVATED"
```

### Verify Database
```javascript
// Check if subscription was activated
db.users.findOne({ email: "user@example.com" })
// Look for: subscriptionStatus: true, subscriptionTier: "Premium"

// Check payment record
db.payments.findOne({ orderId: "subscription_xyz_Premium_1703300000000" })
// Look for: status: "finished"
```

---

## Support

- **NOWPayments API Docs**: https://documenter.getpostman.com/view/7907941/S1a32n38
- **NOWPayments Support**: https://nowpayments.io/support
- **Your API Docs**: See README.md and INTEGRATION_GUIDE.md

---

**Status**: ✅ Webhooks Fully Implemented
- Webhook endpoint configured
- Signature verification enabled  
- Database updates on payment
- Subscription auto-activation ready
- Error handling implemented
