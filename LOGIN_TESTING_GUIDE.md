# Login Testing Guide - With Logger Implementation

This guide shows you how to test the complete login flow with the new logger class that provides detailed console logging for debugging.

## ✅ What's New

The entire auth system now uses a centralized **Logger Class** with structured logging:
- **Logger Methods**: `info()`, `success()`, `error()`, `warn()`, `debug()`, `security()`, `otp()`, `notification()`, `database()`, `http()`, `performance()`
- **Format**: `[TIMESTAMP] 🎯 [MODULE_NAME] - message`, `data`
- **Benefits**: Easier debugging, consistent logging, visual emoji indicators, structured output

## 🚀 Start the Server

1. **Open Terminal** in VS Code or command prompt
2. **Navigate to project root**:
   ```bash
   cd c:\Users\alienware\OneDrive\Documents\pronext-backend\pronext-backend
   ```

3. **Start the dev server**:
   ```bash
   npm run dev
   ```

4. **Expected Console Output**:
   ```
   [nodemon] 3.1.11
   [nodemon] watching path(s): *.*
   [nodemon] starting `node app.js`
   ✅ Real-time events handler initialized successfully
   🚀 Server is listening on port 5000
   🔌 Socket.io is ready for real-time connections
   connect to database [connection established]
   ```

## 📝 Test Endpoints (Postman or Curl)

### 1️⃣ REGISTER A NEW USER

**Endpoint**: `POST http://localhost:5000/api/register`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "fname": "John",
  "lname": "Doe",
  "email": "john@test.com",
  "password": "password123",
  "phone": "9876543210",
  "address": "123 Test St",
  "role": "User"
}
```

**Expected Console Logs** (in your terminal):
```
[HH:MM:SS] 📝 [AUTH_CONTROLLER] [START] User registration process {module: "REGISTER"}
[HH:MM:SS] 🔍 [AUTH_CONTROLLER] Checking if user with email john@test.com already exists
[HH:MM:SS] 🔐 [AUTH_CONTROLLER] Hashing password for user john@test.com
[HH:MM:SS] 🔢 [AUTH_CONTROLLER] Generated OTP for email: john@test.com {otp: "123456"}
[HH:MM:SS] 💾 [AUTH_CONTROLLER] User john@test.com registered successfully {userId: "..."}
```

**Expected Response** (JSON):
```json
{
  "success": true,
  "message": "User created successfully. OTP: 123456 (temporary for testing)",
  "data": {
    "userId": "64abcd1234567890",
    "email": "john@test.com",
    "message": "Please verify OTP to complete registration",
    "otp": "123456",
    "otpExpiresIn": "1 minute"
  }
}
```

### 2️⃣ LOGIN

**Endpoint**: `POST http://localhost:5000/api/login`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "email": "john@test.com",
  "password": "password123"
}
```

**Expected Console Logs** (in your terminal):
```
[HH:MM:SS] 📝 [AUTH_CONTROLLER] [START] Login attempt {email: "john@test.com"}
[HH:MM:SS] 🔍 [AUTH_CONTROLLER] Looking up user with email: john@test.com
[HH:MM:SS] 🔐 [AUTH_CONTROLLER] Verifying password for user: john@test.com
[HH:MM:SS] ✅ [AUTH_CONTROLLER] Password verified for user: john@test.com
[HH:MM:SS] 🔢 [AUTH_CONTROLLER] Generated OTP for login: john@test.com {otp: "654321"}
[HH:MM:SS] ℹ️  [AUTH_CONTROLLER] Enforcing single session for user: john@test.com
[HH:MM:SS] ℹ️  [AUTH_CONTROLLER] Returning OTP to user: john@test.com for verification
[HH:MM:SS] ✅ [AUTH_CONTROLLER] Login successful for user: john@test.com {loginsToday: 1}
```

**Expected Response** (JSON):
```json
{
  "success": true,
  "message": "Login successful. (1/5 logins used today). OTP: 654321 (temporary for testing)",
  "data": {
    "user": {
      "id": "64abcd1234567890",
      "name": "John Doe",
      "email": "john@test.com",
      "role": "User",
      "phone": "9876543210",
      "loginsToday": 1
    },
    "otp": "654321",
    "otpExpiresIn": "1 minute",
    "message": "Please verify OTP to complete login",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3️⃣ VERIFY OTP (After Login)

**Endpoint**: `POST http://localhost:5000/api/verify-otp`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "email": "john@test.com",
  "otp": "654321"
}
```

**Expected Console Logs** (in your terminal):
```
[HH:MM:SS] 📝 [AUTH_CONTROLLER] [START] OTP verification process {email: "john@test.com"}
[HH:MM:SS] 🔍 [AUTH_CONTROLLER] Checking OTP expiration {email: "john@test.com"}
[HH:MM:SS] ✅ [AUTH_CONTROLLER] OTP verified for user: john@test.com
[HH:MM:SS] 🔐 [AUTH_CONTROLLER] Generating JWT token for user: john@test.com
[HH:MM:SS] ✅ [AUTH_CONTROLLER] User john@test.com successfully verified and logged in
```

**Expected Response** (JSON):
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "64abcd1234567890",
      "fname": "John",
      "lname": "Doe",
      "email": "john@test.com",
      "role": "User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4️⃣ RESEND OTP

**Endpoint**: `POST http://localhost:5000/api/resend-otp`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "email": "john@test.com"
}
```

**Expected Console Logs** (in your terminal):
```
[HH:MM:SS] 📝 [AUTH_CONTROLLER] [START] OTP resend process {email: "john@test.com"}
[HH:MM:SS] 🔢 [AUTH_CONTROLLER] Generated new OTP for email: john@test.com {otp: "789012"}
[HH:MM:SS] 💾 [AUTH_CONTROLLER] New OTP saved for user: john@test.com
[HH:MM:SS] ℹ️  [AUTH_CONTROLLER] Attempting to send Email to: john@test.com
[HH:MM:SS] ✅ [AUTH_CONTROLLER] New OTP resent successfully for user: john@test.com
```

**Expected Response** (JSON):
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "data": {
    "email": "john@test.com",
    "phone": "9876543210",
    "otp": "789012",
    "message": "New OTP has been generated. Use it within 1 minute."
  }
}
```

## 🔍 Logger Output Breakdown

Each log line follows this format:

```
[TIMESTAMP] EMOJI [MODULE_NAME] - Message additional_data
```

### Emoji Meanings:
- `📝` = Starting an operation
- `✅` = Success
- `❌` = Error/Failure
- `⚠️` = Warning
- `🔍` = Debug/Checking
- `🔐` = Security/Password related
- `🔢` = OTP related
- `📧` = Email/Notification
- `💾` = Database operation
- `ℹ️` = Info
- `🌐` = HTTP request
- `⏱️` = Performance/Timing

## 🐛 Debugging Tips

1. **Check Console Logs**: All operations now log to console with structured format
2. **Track Flow**: Follow emoji sequence to understand operation flow
3. **Identify Issues**: Error logs (❌) will show exactly where issues occur
4. **Performance**: Timing logs (⏱️) help identify slow operations

## 📦 Using Logger in New Controllers

To use the logger in any controller:

```javascript
import logger from "../../helpers/logger.js";

// Create a module-specific logger
const myLogger = logger.module("MY_MODULE");

// Use logging methods
myLogger.start("Operation starting");        // 📝
myLogger.success("Operation succeeded");     // ✅
myLogger.error("Something went wrong", err); // ❌
myLogger.warn("Warning message");             // ⚠️
myLogger.debug("Debug info");                 // 🔍
myLogger.security("Auth check passed");      // 🔐
myLogger.otp("OTP generated");               // 🔢
myLogger.notification("Email sent");         // 📧
myLogger.database("User saved");             // 💾
myLogger.http("GET /api/users");             // 🌐
myLogger.performance("Query took 50ms");     // ⏱️
```

## ✨ Summary

- ✅ **Logger class created** in `helpers/logger.js`
- ✅ **authContoller.js** updated with logger
- ✅ **userController.js** updated with logger
- 🔄 **Other controllers** can be updated similarly
- 📊 All logging structured for easy debugging
- 🎯 Clear visual indicators with emojis
- 🚀 Ready for production with minimal changes

---

**Happy Debugging!** 🎉
