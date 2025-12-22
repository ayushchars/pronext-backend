# ProNext Subscription Workflow

## 🔄 Complete Subscription Flow

### 1. **User Registration (No Subscription Yet)**
```
POST /api/register
Body: {
  "fname": "John",
  "lname": "Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "phone": "9876543210",
  "role": "User"
}

Response: User created (subscriptionStatus = false)
```

### 2. **User Verifies OTP**
```
POST /api/verify-otp
Body: {
  "email": "john@example.com",
  "otp": "123456"
}

Response: Auth token issued (user can now access payment endpoints)
```

### 3. **User Initiates Payment (Subscription Purchase)**
```
POST /api/payments/invoice
Header: Authorization: Bearer {auth_token}
Body: {
  "price_amount": 10,
  "price_currency": "USD",
  "pay_currency": "USDT",
  "order_id": "order_123",
  "order_description": "Premium Subscription - 1 Month"
}

Response: 
{
  "invoiceId": "inv_xxx",
  "paymentUrl": "https://nowpayments.io/invoice/...",
  "walletAddress": "Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" (TRC20 address)
}
```

### 4. **User Sends USDT TRC20 Payment**
- User visits the `paymentUrl` OR
- User sends USDT directly to the wallet address
- Amount: 10 USDT (or equivalent)
- Network: Tron (TRC20)

### 5. **NOWPayments Processes Payment**
- Payment received ✓
- Status updated to "finished"
- IPN webhook sent to our server

### 6. **Webhook Updates Subscription**
```
POST /api/payments/webhook (called by NOWPayments)

Automatic actions:
✓ Payment status → "finished"
✓ subscriptionStatus → true
✓ subscriptionTier → determined by amount paid
✓ subscriptionExpiryDate → set to 30 days from now
✓ lastPaymentDate → current date
```

### 7. **User Has Active Subscription**
- Can access premium features
- Subscription valid for 30 days
- Receives renewal reminder before expiry

---

## 💳 Subscription Tiers

| Tier | Price (USD) | Price (USDT) | Duration | Features |
|------|------------|------------|----------|----------|
| Basic | $5 | 5 USDT | 30 days | Core features |
| Premium | $15 | 15 USDT | 30 days | Advanced features |
| Pro | $30 | 30 USDT | 30 days | All features |

---

## 🪙 USDT TRC20 Configuration

### Supported Payment Currencies
- **USDT** (Tron/TRC20) ✓
- **BTC** (Bitcoin)
- **ETH** (Ethereum)
- **LTC** (Litecoin)
- And 200+ more

### Why USDT TRC20?
- ✓ Low transaction fees
- ✓ Fast confirmations (15-30 seconds)
- ✓ Stable value (pegged to USD)
- ✓ Widely accepted

---

## 📊 Database Fields Updated on Payment

```javascript
// User Model Updates on Successful Payment
{
  subscriptionStatus: true,           // Is subscription active?
  subscriptionTier: "Premium",        // Basic | Premium | Pro
  subscriptionExpiryDate: Date,       // When subscription expires
  lastPaymentDate: Date,              // Last successful payment
  totalPayoutRequested: Number        // Tracking for analytics
}
```

---

## 🔗 Testing Subscription Flow

### Postman Collection Sequence
1. **Register User** → Get userId
2. **Verify OTP** → Get auth_token
3. **Create Payment Invoice** → Get paymentUrl
4. **Simulate Payment** → Use test wallet or actual USDT
5. **Check Payment Status** → Verify "finished"
6. **Verify Subscription** → User now has active subscription

### Test USDT TRC20 Addresses
For testing, you can use:
- Any TRC20-compatible wallet (MetaMask, TronLink)
- Test amount: 1-30 USDT
- Tron Testnet or Mainnet

---

## 🔐 Webhook Security

All webhook calls are verified using:
- **Signature**: X-Signature header
- **Secret**: NOWPAYMENTS_IPN_SECRET from .env
- Only authentic NOWPayments callbacks update subscriptions

---

## ⏰ Subscription Lifecycle

```
User Registers
    ↓
User Unverified (subscriptionStatus = false)
    ↓
User Verifies OTP
    ↓
User Creates Payment Order
    ↓
User Sends USDT TRC20 Payment
    ↓
NOWPayments Processes (2-5 minutes)
    ↓
Webhook Received
    ↓
Subscription Activated ✓
    ↓
Active for 30 Days
    ↓
Reminder Email (Day 25)
    ↓
Expires (Unless Renewed)
```

---

## 🛠️ Implementation Notes

### Payment Model (paymentModel.js)
- Tracks every payment transaction
- Linked to userId
- Stores NOWPayments metadata

### User Model (authModel.js)
- subscriptionStatus: Boolean
- subscriptionTier: "Basic" | "Premium" | "Pro"
- subscriptionExpiryDate: Date
- lastPaymentDate: Date

### Controller (paymentController.js)
- `createPaymentInvoice()` - Initiates payment
- `handleIPNCallback()` - Processes webhook (activates subscription)
- `getPaymentStatus()` - Check payment status

---

## 🚀 Quick Start for Testing

```bash
# 1. Register a user
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"fname":"Test","lname":"User","email":"test@example.com","password":"Pass123!","phone":"1234567890","role":"User"}'

# 2. Verify OTP (use returned OTP)
curl -X POST http://localhost:5000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'

# 3. Create payment (with auth token from step 2)
curl -X POST http://localhost:5000/api/payments/invoice \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"price_amount":10,"price_currency":"USD","pay_currency":"USDT","order_id":"order_123","order_description":"Premium Subscription"}'

# 4. User sends USDT to wallet address returned in step 3
# 5. Payment processed automatically
# 6. Subscription activated!
```

---

## ✅ Verification

Check if subscription is active:
```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer {token}"

# Response includes:
{
  "subscriptionStatus": true,
  "subscriptionTier": "Premium",
  "subscriptionExpiryDate": "2024-01-22T00:00:00Z"
}
```
