# 🚀 Webhook Quick Reference Card

## Webhook Endpoint
```
POST /api/payments/webhook
Authentication: Signature-based (X-Signature header)
```

## Required Environment Variables
```bash
NOWPAYMENTS_IPN_SECRET=your_secret_from_dashboard
NOWPAYMENTS_API_KEY=your_api_key
BASE_URL=https://yourdomain.com
```

## Webhook Payload
```json
{
  "order_id": "subscription_xyz_Premium_1703300000000",
  "payment_id": "pay_123456789",
  "payment_status": "finished",
  "price_amount": 15,
  "price_currency": "USD",
  "pay_currency": "USDT",
  "outcome_at": "2024-12-23T10:30:45Z"
}
```

## Headers
```
X-Signature: {HMAC-SHA512 signature}
Content-Type: application/json
```

## Response Codes
- **200 OK** - Webhook processed successfully
- **401 Unauthorized** - Invalid signature
- **200 OK** - Error occurred (still return OK to prevent retries)

## Subscription Tiers
| Amount | Tier | Duration |
|--------|------|----------|
| 5 USDT | Basic | 30 days |
| 15 USDT | Premium | 30 days |
| 30 USDT | Pro | 30 days |

## Payment Statuses
| Status | Subscription |
|--------|--------------|
| `waiting` | ❌ Not active |
| `confirming` | ❌ Not active |
| `confirmed` | ❌ Not active |
| **`finished`** | **✅ ACTIVE** |
| `failed` | ❌ Not active |
| `expired` | ❌ Not active |

## Test Webhook Locally
```bash
node helpers/webhookTestHelper.js --all
```

## Configure NOWPayments
1. Log in to dashboard
2. Settings → Webhooks
3. Set URL: `https://yourdomain.com/api/payments/webhook`
4. Copy IPN Secret to `.env`

## Database Updates (on status="finished")
```javascript
// Payment Record
{ status: "finished", paymentId: "pay_123...", lastUpdated: Date }

// User Record
{
  subscriptionStatus: true,
  subscriptionTier: "Premium",
  subscriptionExpiryDate: Date,  // 30 days from now
  lastPaymentDate: Date
}
```

## Verify Signature (Manual)
```bash
# Using openssl
echo -n '{"order_id":"test"}' | openssl dgst -sha512 -hmac "your_secret" -hex
```

## Check Logs
```bash
# Watch for successful activation
tail -f logs/*.log | grep "SUBSCRIPTION ACTIVATED"

# Watch for all webhooks
tail -f logs/*.log | grep -i webhook
```

## Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| Invalid signature | Wrong secret | Check NOWPAYMENTS_IPN_SECRET in .env |
| Payment not found | Order ID mismatch | Ensure order_id matches payment record |
| Connection refused | Server not running | Start with `npm start` |

## Files
- **Handler**: [controller/payment/paymentController.js](controller/payment/paymentController.js#L374)
- **Service**: [helpers/nowpaymentsService.js](helpers/nowpaymentsService.js#L303)
- **Routes**: [controller/payment/payment.js](controller/payment/payment.js#L43)
- **Test Helper**: [helpers/webhookTestHelper.js](helpers/webhookTestHelper.js)
- **Guides**: 
  - [WEBHOOK_IMPLEMENTATION_GUIDE.md](WEBHOOK_IMPLEMENTATION_GUIDE.md)
  - [WEBHOOK_SETUP_QUICK_START.md](WEBHOOK_SETUP_QUICK_START.md)
  - [WEBHOOK_TESTING_GUIDE.md](WEBHOOK_TESTING_GUIDE.md)

## Quick Checklist
- [ ] `.env` has IPN secret
- [ ] Server running (`npm start`)
- [ ] Test helper passes all tests
- [ ] NOWPayments dashboard webhook configured
- [ ] Real payment test successful
- [ ] Check logs for "SUBSCRIPTION ACTIVATED"
- [ ] Verify database updated
- [ ] Monitor webhooks in production

## Support
- Implementation: [WEBHOOK_IMPLEMENTATION_GUIDE.md](WEBHOOK_IMPLEMENTATION_GUIDE.md)
- Testing: [WEBHOOK_TESTING_GUIDE.md](WEBHOOK_TESTING_GUIDE.md)
- Setup: [WEBHOOK_SETUP_QUICK_START.md](WEBHOOK_SETUP_QUICK_START.md)

---

**Status**: ✅ Webhooks fully implemented and ready for production
