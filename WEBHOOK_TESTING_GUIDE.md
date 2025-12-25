# 🧪 Webhook Testing Guide

## Quick Start - Test Webhooks in 30 Seconds

### Option 1: Test All Webhook Scenarios
```bash
node helpers/webhookTestHelper.js --all
```

This runs 6 test scenarios:
- ✅ Successful Payment (Premium)
- 💎 Basic Tier Payment (5 USDT)
- 👑 Pro Tier Payment (30 USDT)
- ❌ Failed Payment
- ⏱️ Expired Payment
- ⏳ Confirming Payment

### Option 2: Test Single Scenario
```bash
node helpers/webhookTestHelper.js successfulPayment
node helpers/webhookTestHelper.js failedPayment
node helpers/webhookTestHelper.js proTierPayment
```

Available scenarios:
- `successfulPayment` - Premium tier payment successful
- `basicTierPayment` - Basic tier (5 USDT)
- `proTierPayment` - Pro tier (30 USDT)
- `failedPayment` - Payment failed
- `expiredPayment` - Payment expired
- `confirmingPayment` - Payment confirming (not activated)

---

## Prerequisites

Ensure your `.env` has:
```bash
NOWPAYMENTS_IPN_SECRET=your_secret_here
SERVER_URL=http://localhost:5000  # Or your server URL
```

---

## What the Tests Do

### 1. Test Signature Verification
- Sends invalid signature → Expects 401 Unauthorized
- Sends valid signature → Expects 200 OK

### 2. Test Payment Statuses
Each test scenario sends a webhook with different payment status:

| Scenario | Status | Expected Result |
|----------|--------|-----------------|
| Successful | `finished` | ✅ Subscription activated |
| Basic Tier | `finished` | ✅ Basic subscription (5 USDT) |
| Pro Tier | `finished` | ✅ Pro subscription (30 USDT) |
| Failed | `failed` | ⚠️ Payment marked as failed |
| Expired | `expired` | ⏱️ Invoice marked as expired |
| Confirming | `confirming` | ⏳ Subscription NOT activated |

---

## Expected Output

### Success
```
╔══════════════════════════════════════════════════════════════════╗
║          🔔 WEBHOOK TESTING HELPER - ProNext Payments             ║
╚══════════════════════════════════════════════════════════════════╝

🎯 Server: http://localhost:5000
🔑 IPN Secret: test_secret...

1️⃣  Testing Signature Verification...
   Testing with invalid signature...
   ✅ Server rejected invalid signature (Good!)
   Testing with valid signature...
   ✅ Server accepted valid signature

2️⃣  Running Test Scenarios...

📤 Sending Test Webhook: ✅ Successful Payment (Premium Tier)
✅ Success Response:
Status: 200
Data: { message: 'Webhook processed successfully' }

[... more tests ...]

📊 TEST SUMMARY
✅ Passed: 6
❌ Failed: 0
📈 Total: 6

🎉 All tests passed! Webhooks are working correctly.
```

---

## Troubleshooting Test Failures

### Issue: "Connection refused"
```
Solution:
1. Make sure server is running: npm start
2. Check SERVER_URL in .env or command
3. Verify port 5000 is not blocked
```

### Issue: "Invalid signature"
```
Solution:
1. Check NOWPAYMENTS_IPN_SECRET in .env matches webhook handler
2. Verify signature generation is using correct secret
3. Ensure payload is not modified
```

### Issue: "Webhook processing failed"
```
Solution:
1. Check server logs for errors
2. Verify database connection is working
3. Ensure payment model has correct schema
4. Check user exists in database
```

### Issue: "Payment record not found"
```
Solution:
1. This is expected for first-time test with random order_id
2. To test database updates, use real payment flow first
3. Or manually create payment record in database
```

---

## Integration with Real Payments

### After Webhook Testing
1. ✅ Verify webhook handler processes payloads correctly
2. ✅ Confirm signature verification works
3. ✅ Check server logs for "SUBSCRIPTION ACTIVATED" messages
4. ✅ Proceed to real NOWPayments payment testing

### Real Payment Testing
1. **Register user** via `/api/register`
2. **Verify OTP** via `/api/verify-otp`
3. **Create subscription** via `/api/payments/subscribe`
4. **Send USDT payment** to provided wallet
5. **Wait 2-5 minutes** for NOWPayments to process
6. **Check logs** for webhook message
7. **Verify database** shows subscription activated

---

## Advanced Testing

### Custom Test Payload
```javascript
// In webhookTestHelper.js, add custom scenario:
customPayment: {
  name: "🔧 Custom Test",
  payload: {
    order_id: "custom_test_123",
    payment_id: "payment_custom_123",
    payment_status: "finished",
    price_amount: 20,  // Custom amount
    price_currency: "USD",
    pay_currency: "USDT",
    outcome_at: new Date().toISOString(),
  },
}
```

Then run:
```bash
node helpers/webhookTestHelper.js customPayment
```

### Using Postman
1. Import `ProNext-NOWPayments-Collection.json`
2. Go to **Webhook Test** request
3. Update `order_id` and `payment_id`
4. Generate signature using HMAC-SHA512
5. Add `X-Signature` header
6. Send POST request

---

## Monitoring During Tests

### Terminal 1: Run Tests
```bash
node helpers/webhookTestHelper.js --all
```

### Terminal 2: Watch Logs
```bash
tail -f logs/*.log | grep -i webhook
```

### Terminal 3: Monitor Database
```bash
# Watch for subscription updates
mongosh
db.users.find({ subscriptionStatus: true })
db.payments.find({ status: "finished" })
```

---

## Performance Testing

### Simulate Multiple Webhooks
```bash
# Test rapid webhook processing
for i in {1..10}; do
  node helpers/webhookTestHelper.js successfulPayment
  sleep 1
done
```

Expected: All webhooks should be processed within 1 second each.

---

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Test Webhooks
  run: node helpers/webhookTestHelper.js --all
  env:
    SERVER_URL: http://localhost:5000
    NOWPAYMENTS_IPN_SECRET: ${{ secrets.NOWPAYMENTS_IPN_SECRET }}
```

---

## Webhook Testing Checklist

- [ ] Server is running (`npm start`)
- [ ] `.env` has `NOWPAYMENTS_IPN_SECRET`
- [ ] `.env` has `SERVER_URL` (or using default)
- [ ] Database is connected
- [ ] Run test helper: `node helpers/webhookTestHelper.js --all`
- [ ] All 6 tests pass
- [ ] Check server logs for webhook messages
- [ ] Verify database shows subscription updates
- [ ] Test real payment flow
- [ ] Check NOWPayments dashboard for webhook history

---

## Support & Debugging

### Check Webhook Request Details
```javascript
// Add this to paymentController.js handleIPNCallback for debugging:
paymentLogger.debug("Raw webhook body:", req.body);
paymentLogger.debug("Signature from header:", req.headers["x-signature"]);
```

### View NOWPayments Webhook History
1. Log in to NOWPayments dashboard
2. Go to **Webhooks** or **API Status**
3. View recent webhook calls and responses
4. Check if webhook URL is reachable

### Test with curl
```bash
curl -X POST http://localhost:5000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: your_signature_here" \
  -d '{
    "order_id": "test_123",
    "payment_id": "payment_123",
    "payment_status": "finished",
    "price_amount": 15
  }'
```

---

## Summary

✅ **Webhook Implementation**: Complete
- Endpoint configured at `/api/payments/webhook`
- Signature verification enabled
- Payment detection implemented
- Subscription auto-activation ready
- Test helper provided for validation

🧪 **Testing Status**: Ready to test
- Use `webhookTestHelper.js` for automated testing
- Test all 6 payment scenarios
- Verify with real NOWPayments payments
- Monitor logs and database updates

🚀 **Next**: Configure NOWPayments webhook URL and test real payments!
