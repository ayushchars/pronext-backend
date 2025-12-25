# 📥 File Download Protection - Subscription Required

**Implemented:** December 23, 2025

---

## 📌 Overview

All video and PDF file downloads are now **protected by subscription validation**. Users must have an **active, non-expired subscription** to access any downloadable files.

---

## 🔒 Protected Endpoints

### Files Requiring Active Subscription:

1. **GET `/api/upload`** - Get all files (list)
   - Requires active subscription
   - Returns all available files for download

2. **GET `/api/upload/:id`** - Get file by ID (download)
   - Requires active subscription
   - Returns specific file for download

### Unprotected Endpoints (No Subscription Required):

1. **POST `/api/upload/upload`** - Upload file
   - Admin/Staff only
   - No subscription check needed

2. **PUT `/api/upload/:id`** - Update file metadata
   - Admin only
   - No subscription check needed

3. **DELETE `/api/upload/:id`** - Delete file
   - Admin only
   - No subscription check needed

---

## 🛡️ Subscription Validation Logic

The `hasActiveSubscription` middleware checks:

### 1. **Subscription Status**
```javascript
// User must have subscriptionStatus = true
if (!req.user.subscriptionStatus) {
  return 403 Forbidden
  message: "Active subscription is required to access this resource"
}
```

### 2. **Subscription Expiry**
```javascript
// If subscription has expiry date, it must not be in the past
if (currentDate > subscriptionExpiryDate) {
  return 403 Forbidden
  message: "Your subscription has expired. Please renew to continue."
}
```

---

## 📋 Response Examples

### ✅ Success Response (Subscription Active)
```json
{
  "status": 1,
  "message": "Files fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Advanced Marketing Strategies",
      "type": "pdf",
      "description": "Comprehensive guide to modern marketing",
      "fileUrl": "https://storage.example.com/file.pdf",
      "uploadedBy": {
        "_id": "507f1f77bcf86cd799439012",
        "fname": "Admin",
        "lname": "User",
        "email": "admin@example.com"
      },
      "isActive": true,
      "createdAt": "2025-12-20T10:00:00.000Z",
      "updatedAt": "2025-12-20T10:00:00.000Z"
    }
  ]
}
```

### ❌ Error Response (No Subscription)
```json
{
  "success": false,
  "message": "Active subscription is required to access this resource",
  "code": "NO_SUBSCRIPTION"
}
```

### ❌ Error Response (Subscription Expired)
```json
{
  "success": false,
  "message": "Your subscription has expired. Please renew to continue.",
  "code": "SUBSCRIPTION_EXPIRED",
  "expiryDate": "2025-12-15T00:00:00.000Z"
}
```

### ❌ Error Response (Not Authenticated)
```json
{
  "success": false,
  "message": "JWT token missing"
}
```

---

## 🔑 Middleware Implementation

### New Middleware Added:

**Location:** [middleware/authMiddleware.js](middleware/authMiddleware.js)

```javascript
export const hasActiveSubscription = (req, res, next) => {
  // 1. Checks user authentication
  // 2. Verifies subscriptionStatus = true
  // 3. Validates subscriptionExpiryDate is not expired
  // 4. Returns appropriate error code
}
```

### Route Configuration:

**Location:** [controller/files/files.js](controller/files/files.js)

```javascript
// Protected routes - subscription required
router.get("/", requireSignin, hasActiveSubscription, getAllFiles);
router.get("/:id", requireSignin, hasActiveSubscription, getFileById);

// Unprotected routes - admin only
router.post("/upload", requireSignin, upload.single("file"), uploadFile);
router.put("/:id", requireSignin, updateFile);
router.delete("/:id", requireSignin, deleteFile);
```

---

## 🧪 Testing the Protection

### 1. Without Subscription
```bash
curl -X GET http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN"
  
# Response: 403 Forbidden - "Active subscription is required"
```

### 2. With Active Subscription
```bash
curl -X GET http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN"
  
# Response: 200 OK - List of files
```

### 3. With Expired Subscription
```bash
curl -X GET http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN"
  
# Response: 403 Forbidden - "Your subscription has expired"
```

---

## 📊 User Model Fields Used

### Fields Referenced:
- `subscriptionStatus` (Boolean) - Default: false
- `subscriptionExpiryDate` (Date) - Default: null
- `subscriptionTier` (String) - "Basic", "Premium", "Pro"

### Location: [models/authModel.js](models/authModel.js)

---

## 🔄 Integration with Payment System

When a user subscribes:

1. **Payment processed** via `/api/payments/subscribe`
2. **User record updated:**
   ```javascript
   {
     subscriptionStatus: true,
     subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
     subscriptionTier: "Premium"
   }
   ```
3. **File access enabled** automatically
4. **On expiry**, access is automatically revoked

---

## 🎯 File Types Protected

Both file types require subscription:
- ✅ **PDF** files (.pdf)
- ✅ **PowerPoint** files (.ppt, .pptx)
- ✅ **Video** files (if implemented)
- ✅ **eBook** files (.epub, .mobi)

---

## 🚀 How to Use

### For Frontend Developers:

1. **Check subscription status before showing file list:**
```javascript
// Make request to get files
const response = await fetch('/api/upload', {
  headers: { Authorization: `Bearer ${token}` }
});

if (response.status === 403) {
  // Show subscription upgrade prompt
  alert('Please upgrade to access files');
}
```

2. **Handle error responses:**
```javascript
if (data.code === 'NO_SUBSCRIPTION') {
  // Redirect to subscription page
}
if (data.code === 'SUBSCRIPTION_EXPIRED') {
  // Show renewal prompt
}
```

---

## 🔧 Admin Override (if needed)

To temporarily allow access without subscription (for testing), admins can:

1. **Directly set in database:**
```javascript
db.users.updateOne(
  { _id: userId },
  { 
    subscriptionStatus: true,
    subscriptionExpiryDate: new Date('2099-12-31')
  }
)
```

2. **Or via future admin API endpoint** (to be implemented if needed)

---

## 📝 Logging

All file access attempts are logged:

```
✅ Files fetched successfully (subscription verified) 
   → userId: xxx, count: 5, type: pdf

❌ File access denied - No subscription
   → userId: xxx, code: NO_SUBSCRIPTION

❌ File access denied - Subscription expired
   → userId: xxx, code: SUBSCRIPTION_EXPIRED, expiryDate: xxx
```

---

## ✨ Security Features

- ✅ JWT token required for all requests
- ✅ Subscription status verified server-side
- ✅ Expiry date checked against current date
- ✅ Clear error messages for frontend
- ✅ Audit logging of all download attempts
- ✅ No direct file access without proper validation

---

## 🔄 Future Enhancements

Potential additions:
1. **Tier-based access** - Different file types for different tiers
2. **Download quota** - Limit downloads per month/tier
3. **File expiration** - Auto-delete old files
4. **Access logs** - Track user file downloads
5. **Rate limiting** - Prevent abuse of downloads

---

## 📞 Support

For questions or issues with file access protection:
1. Check subscription status in user profile
2. Verify subscription hasn't expired
3. Check server logs for detailed error messages
4. Review middleware configuration

---

**Status: ✅ ACTIVE AND ENFORCED**

All file download endpoints are now protected and requiring active subscription.
