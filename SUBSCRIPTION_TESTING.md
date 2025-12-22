# 🚀 Subscription Payment Testing Guide

## Quick Start: Buy Subscription in 3 Steps

### Step 1: Register User
```bash
POST /api/register
{
  "fname": "John",
  "lname": "Doe",
  "email": "test@example.com",
  "password": "Password123!",
  "phone": "1234567890",
  "role": "User"
}

Response: { otp: "123456" }
```

### Step 2: Verify OTP & Get Auth Token
```bash
POST /api/verify-otp
{
  "email": "test@example.com",
  "otp": "123456"
}

Response: { auth_token: "eyJhbGc..." }
```

### Step 3: Buy Subscription (New Endpoint!)
```bash
POST /api/payments/subscribe
Header: Authorization: Bearer {auth_token}
{
  "subscriptionTier": "Premium",
  "pay_currency": "USDT"
}

Response:
{
  "invoiceId": "inv_123456",
  "orderId": "subscription_xyz_Premium_1703300000000",
  "paymentUrl": "https://nowpayments.io/invoice/...",
  "subscriptionTier": "Premium",
  "amount": 15,
  "currency": "USD",
  "payCurrency": "USDT",
  "walletAddress": "Txxxxxxxxxxxxxxxxxxxx"
}
```

### Step 4: User Sends USDT Payment
- Visit `paymentUrl` OR
- Send 15 USDT to wallet address
- Wait for payment confirmation (15-30 seconds)
- ✅ Subscription automatically activated!

---

## 📊 Subscription Tiers & Pricing

| Tier | USDT Amount | USD Value | Duration | Features |
|------|-------------|-----------|----------|----------|
| **Basic** | 5 USDT | $5 | 30 days | Core features |
| **Premium** | 15 USDT | $15 | 30 days | Advanced features + Priority |
| **Pro** | 30 USDT | $30 | 30 days | All features + Support |

---

## 🔄 What Happens After Payment

### Automatic Updates (via Webhook)
When payment is confirmed (`status: "finished"`):

```javascript
User {
  subscriptionStatus: true,           // ✅ Active
  subscriptionTier: "Premium",        // Based on amount paid
  subscriptionExpiryDate: (30 days),  // Auto expiry
  lastPaymentDate: (now)
}
```

### Response includes payment wallet
- Direct USDT TRC20 address for wallet transfers
- Payment URL for invoice flow
- All in one response!

---

## 🪙 Supported Currencies for Payment

Users can pay subscription with ANY supported currency:
- ✅ **USDT** (Tron/TRC20) - Recommended!
- ✅ **BTC** (Bitcoin)
- ✅ **ETH** (Ethereum)
- ✅ **LTC** (Litecoin)
- ✅ **USDC**, **USDT** (Ethereum), and 200+ more

Just change `pay_currency` parameter:
```json
{
  "subscriptionTier": "Premium",
  "pay_currency": "BTC"     // or "ETH", "LTC", etc.
}
```

---

## ✅ Postman Testing

1. **Import Collection**
   - Open Postman
   - Import `ProNext-NOWPayments-Collection.json`

2. **Run These in Order:**
   - ✅ Register User
   - ✅ Verify OTP
   - ✅ **🎯 Buy Subscription** ← NEW ENDPOINT
   - ✅ Check Payment Status
   - ✅ Get User Payments

3. **Verify Subscription**
   ```bash
   GET /api/user/profile
   Header: Authorization: Bearer {token}
   
   Response includes:
   {
     "subscriptionStatus": true,
     "subscriptionTier": "Premium",
     "subscriptionExpiryDate": "2024-01-22"
   }
   ```

---

## 🛠️ Technical Details

### New Endpoint
- **Path:** `POST /api/payments/subscribe`
- **Auth:** Required (Bearer token)
- **Body:** `{ subscriptionTier, pay_currency }`
- **Returns:** Invoice with payment link & wallet address

### Automatic Flow
1. User creates subscription payment
2. NOWPayments processes USDT transfer
3. Webhook confirms payment
4. Subscription activated instantly
5. User gets full access

### Database Changes
- `subscriptionStatus` → `true`
- `subscriptionTier` → `"Premium"` (etc)
- `subscriptionExpiryDate` → 30 days from now
- `lastPaymentDate` → current date

---

## 🔐 Security

✅ All webhooks verified with signature  
✅ Only authentic NOWPayments calls update subscriptions  
✅ Users must be authenticated to buy  
✅ USDT on Tron network (TRC20)  

---

## 💡 Why USDT TRC20?

- **Cheap:** ~1 cent transaction fee
- **Fast:** Confirms in 15-30 seconds
- **Stable:** Always worth $1 USD
- **Trusted:** Tether (USDT) is most used stablecoin
- **Global:** Works worldwide

---

## 🎯 Complete User Journey

```
1. User Sign Up
   ↓
2. Verify Email (OTP)
   ↓
3. Browse Subscription Tiers
   ↓
4. Click "Subscribe Now"
   ↓
5. Choose Currency (USDT, BTC, ETH, etc)
   ↓
6. Send Crypto Payment
   ↓
7. Confirmation (15-30 sec)
   ↓
✅ Subscription Active!
   ↓
Access Premium Features
```

---

## 📞 Support

- Payment Issues? Check webhook logs in terminal
- Subscription not activated? Check payment status
- Need different tier? Create new payment
- Questions? Check SUBSCRIPTION_WORKFLOW.md

**Ready to test? Start with the new `/api/payments/subscribe` endpoint!** 🎉
