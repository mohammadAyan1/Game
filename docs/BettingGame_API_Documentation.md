# BettingGame API Documentation

Generated on: 2026-03-31
Code analyzed from:
- `server/` main app backend
- `Backend/` payment backend
- `client/` main app frontend
- `Frontend/` payment frontend

This document is code-based. I mapped each API from routes, controllers, frontend calls, and your shared DB schema. Where code and schema do not match, I called that out in the "Known Mismatches" section.

## 1. Quick Summary

Base URLs used by the project:
- Main app API: `<VITE_BACKEND_MAIN_URL>/api`
- Payment API: `<VITE_BACKEND_PAYMENT_URL>/api`
- Socket.IO realtime URL: `<VITE_BACKEND_MAIN_URL>`

Auth used by the project:
- Main app login sets an HTTP-only cookie named `token`
- Most protected main-app APIs also accept `Authorization: Bearer <jwt>`
- `GET /api/checkuser` is cookie-only in current code

Main DB tables involved:
- `users`
- `transactions`
- `withdrawal_requests`
- `coin_packages`
- `bank_accounts`

## 2. Recommended Call Order

### 2.1 User auth flow
1. `POST /api/auth/register`
2. `POST /api/auth`
3. `GET /api/checkuser`
4. `GET /api/wallet/get-total-coin`

### 2.2 Deposit/topup flow
1. `GET /api/admin/package`
2. `POST /api/txn/create`
3. `GET /api/txn/:txnId`
4. `POST /api/payment/submit-proof`
5. Poll `GET /api/payment/result/:txnId`
6. After admin approval, refresh `GET /api/wallet/history` or `GET /api/wallet/get-total-coin`

### 2.3 Game result flow
1. Connect Socket.IO to main backend
2. Listen `multiplier`
3. Listen `crash`
4. On win/loss save result using `POST /api/wallet/save-game-result`

### 2.4 Withdrawal flow
1. `GET /api/wallet/history`
2. `POST /api/wallet/withdrawal`
3. Admin checks `GET /api/withdrawal` or `GET /api/withdrawal/pending`
4. Admin calls `PUT /api/withdrawal/:id/approvereject`
5. User refreshes `GET /api/wallet/history`

### 2.5 Admin setup flow
1. `POST /api/admin/package`
2. `POST /api/admin/bank`
3. `GET /api/stats`
4. `GET /api/user/getAllUser`

## 3. Main App API (`server/`)

### 3.1 GET `/api/checkuser`

Purpose:
- Check current logged-in user from cookie

Auth:
- Required
- Current code reads cookie only, not Bearer header

Request:
- Method: `GET`
- Content-Type: none
- Body: none

Success response fields:
- `success`: boolean
- `id`: int
- `username`: string
- `phone`: string
- `role`: enum string `User | Admin`

Success example:
```json
{
  "success": true,
  "id": 12,
  "username": "moham",
  "phone": "9876543210",
  "role": "User"
}
```

Common errors:
- `401` if token missing
- `401` if token invalid/expired
- `401` if user not found

Used for:
- App boot
- Route protection
- Showing logged-in user details

### 3.2 POST `/api/auth/register`

Purpose:
- Create new user

Auth:
- Not required

Request:
- Method: `POST`
- Content-Type: `application/json`

Request body fields:
- `username`: string, required, saved in `users.Username`
- `phone`: string, required, saved in `users.Phone`
- `password`: string, required, minimum 8 chars in backend, saved hashed in `users.Password`
- `email`: string, optional from frontend, currently ignored by backend
- `confirm`: string, optional, frontend-only, ignored by backend
- `agree`: boolean, optional, frontend-only, ignored by backend

Success response fields:
- `message`: string
- `success`: boolean

Success example:
```json
{
  "message": "User registered successfully",
  "success": true
}
```

Common errors:
- `400` if `username`, `phone`, or `password` missing
- `400` if password length below 8
- `400` if username already exists
- `500` on server error

DB write:
- Inserts into `users (Username, Phone, Password)`

### 3.3 POST `/api/auth`

Purpose:
- Login user by phone and password

Auth:
- Not required

Request:
- Method: `POST`
- Content-Type: `application/json`

Request body fields:
- `phone`: string, required
- `password`: string, required

Success response fields:
- `message`: string
- `success`: boolean
- `user.id`: int
- `user.username`: string
- `user.phone`: string
- `user.role`: enum string `User | Admin`
- `user.token`: string JWT

Success example:
```json
{
  "message": "Login successful",
  "success": true,
  "user": {
    "id": 12,
    "username": "moham",
    "phone": "9876543210",
    "role": "User",
    "token": "<jwt>"
  }
}
```

Side effects:
- Sets cookie `token`

Common errors:
- `400` if phone/password missing
- `401` if invalid credentials
- `500` on server error

### 3.4 GET `/api/auth/logout`

Purpose:
- Clear auth cookie

Auth:
- Not strictly required

Request:
- Method: `GET`

Success response fields:
- `message`: string
- `success`: boolean

Success example:
```json
{
  "message": "Logged out successfully",
  "success": true
}
```

### 3.5 GET `/api/wallet/get-total-coin`

Purpose:
- Get current wallet coin balance

Auth:
- Required

Balance formula in code:
- `profit + topup - loss - withdrawal`
- Only `transactions.status = 'success'` are counted

Request:
- Method: `GET`

Success response fields:
- `success`: boolean
- `totalCoins`: int

Success example:
```json
{
  "success": true,
  "totalCoins": 1420
}
```

DB read:
- Reads from `transactions`

### 3.6 POST `/api/wallet/save-game-result`

Purpose:
- Save win/loss after a game round

Auth:
- Required

Request:
- Method: `POST`
- Content-Type: `application/json`

Request body fields:
- `coins`: number, required, must be `> 0`, saved as integer
- `type`: enum string, required, allowed `profit | loss`
- `game`: string, required in current controller when type is `profit` or `loss`

Success response fields:
- `success`: boolean
- `message`: string
- `transactionId`: string UUID

Success example:
```json
{
  "success": true,
  "message": "Winnings saved!",
  "transactionId": "5f2f4d3c-0f44-4f69-a3e3-1c8d2d44b31f"
}
```

Common errors:
- `401` if user not logged in
- `401` if game name missing
- `400` if coin amount invalid
- `400` if transaction type invalid

DB write:
- Inserts into `transactions`
- Writes: `id`, `user_id`, `coins`, `status='success'`, `type`, `created_at`, `game`

Used by:
- `client/src/components/Aviator.jsx`

### 3.7 POST `/api/wallet/withdrawal`

Purpose:
- User submits withdrawal request

Auth:
- Required

Request:
- Method: `POST`
- Content-Type: `application/json`

Request body fields:
- `coins`: number, required, withdrawal amount in coins
- `upiId`: string, required

Validation:
- user must be logged in
- `coins > 0`
- `upiId` must not be empty
- user must have enough successful coin balance

Success response fields:
- `success`: boolean
- `message`: string
- `transactionId`: string UUID

Success example:
```json
{
  "success": true,
  "message": "Withdrawal request submitted",
  "transactionId": "7c9bdb2d-8c4d-4c1b-b4c7-5f2d7cdb91a2"
}
```

DB writes:
- Inserts pending withdrawal into `transactions`
- Inserts request row into `withdrawal_requests`

Tables used:
- `transactions`
- `withdrawal_requests`

Common errors:
- `400` invalid withdrawal amount
- `400` missing UPI ID
- `400` insufficient balance
- `401` if user not logged in

### 3.8 GET `/api/wallet/history`

Purpose:
- Get user transaction history with current balance

Auth:
- Required

Request:
- Method: `GET`

Success response fields:
- `success`: boolean
- `totalCoins`: int
- `count`: int
- `transactions`: array of transaction objects

Per transaction object fields:
- `id`: string UUID
- `type`: enum string `topup | withdrawal | profit | loss`
- `status`: enum string `pending | submitted | success | failed | expired`
- `amount`: int
- `coins`: int
- `game`: string or `null`
- `upiId`: string or `null`
- `title`: string
- `description`: string
- `createdAt`: datetime string
- `paidAt`: datetime string or `null`

Success example:
```json
{
  "success": true,
  "totalCoins": 820,
  "count": 3,
  "transactions": [
    {
      "id": "abc-uuid",
      "type": "withdrawal",
      "status": "pending",
      "amount": 0,
      "coins": 200,
      "game": null,
      "upiId": "name@upi",
      "title": "Withdrawal",
      "description": "Withdraw 200 coins (UPI: name@upi)",
      "createdAt": "2026-03-31T10:11:12.000Z",
      "paidAt": null
    }
  ]
}
```

DB reads:
- `transactions`
- `withdrawal_requests`

### 3.9 DELETE `/api/wallet/withdrawal/:txId`

Purpose:
- User deletes own pending withdrawal request

Auth:
- Required

Path params:
- `txId`: string UUID

Request:
- Method: `DELETE`

Success response fields:
- `success`: boolean
- `message`: string

Success example:
```json
{
  "success": true,
  "message": "Withdrawal deleted successfully"
}
```

Rules:
- Only owner can delete
- Only `type='withdrawal'`
- Only `status='pending'`

Common errors:
- `404` transaction not found
- `400` cannot delete after approval

DB writes:
- Deletes matching row from `withdrawal_requests`
- Deletes matching row from `transactions`

### 3.10 PUT `/api/wallet/withdrawal/:txId`

Purpose:
- User edits own pending withdrawal request

Auth:
- Required

Path params:
- `txId`: string UUID

Request:
- Method: `PUT`
- Content-Type: `application/json`

Request body fields:
- `coins`: number, required
- `upiId`: string, required by frontend, but backend does not re-validate strongly here

Success response fields:
- `success`: boolean
- `message`: string

Success example:
```json
{
  "success": true,
  "message": "Withdrawal updated"
}
```

Rules:
- Only owner can edit
- Only `status='pending'`

Common errors:
- `404` not found
- `400` cannot edit after approval

DB writes:
- Updates `transactions.coins`
- Updates `withdrawal_requests.amount`
- Updates `withdrawal_requests.upi_id`

### 3.11 GET `/api/admin/package`

Purpose:
- Get all coin packages shown in deposit screen

Auth:
- Not required in current code

Request:
- Method: `GET`

Success response fields:
- `success`: boolean
- `data`: array of package objects

Per package object fields:
- `id`: int
- `rupees`: decimal string or number
- `coins`: int
- `bonus`: int
- `pct`: string
- `label`: string
- `tag`: string or `null`
- `popular`: number `0 | 1`

Success example:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "rupees": "100.00",
      "coins": 130,
      "bonus": 30,
      "pct": "30%",
      "label": "Starter",
      "tag": "Best for new users",
      "popular": 1
    }
  ]
}
```

DB read:
- `coin_packages`

### 3.12 GET `/api/admin/package/:id`

Purpose:
- Get single package details

Auth:
- Not required in current code

Path params:
- `id`: int

Success response fields:
- `success`: boolean
- `data`: package object

Common errors:
- `404` package not found

### 3.13 POST `/api/admin/package`

Purpose:
- Admin creates coin package

Auth:
- Required
- Admin role required

Request:
- Method: `POST`
- Content-Type: `application/json`

Actual body shape expected by controller:
- `form`: object, required wrapper

`form` object fields:
- `rupees`: number or decimal string, required
- `coins`: number, required
- `bonus`: number, required
- `pct`: string, required
- `label`: string, required
- `tag`: string, optional
- `popular`: boolean or number, optional

Success response fields:
- `success`: boolean
- `message`: string
- `data.id`: int

Success example:
```json
{
  "success": true,
  "message": "Package created successfully",
  "data": {
    "id": 9
  }
}
```

DB write:
- Inserts into `coin_packages`

### 3.14 PUT `/api/admin/package/:id`

Purpose:
- Admin updates coin package

Auth:
- Required
- Admin role required

Path params:
- `id`: int

Request:
- Method: `PUT`
- Content-Type: `application/json`

Actual body shape expected by controller:
- Flat JSON fields at root

Fields expected by controller:
- `rupees`: number or decimal string
- `coins`: number
- `bonus`: number
- `pct`: string
- `label`: string
- `tag`: string or `null`
- `popular`: boolean or number

Success response fields:
- `success`: boolean
- `message`: string

Success example:
```json
{
  "success": true,
  "message": "Package updated successfully"
}
```

Common errors:
- `404` package not found
- `403` non-admin user

Important note:
- Current frontend sends `{ form: {...} }`, but this controller expects flat fields. Direct API callers should send flat JSON.

### 3.15 DELETE `/api/admin/package/:id`

Purpose:
- Admin deletes package

Auth:
- Required
- Admin role required

Path params:
- `id`: int

Success response fields:
- `success`: boolean
- `message`: string

Success example:
```json
{
  "success": true,
  "message": "Package deleted successfully"
}
```

### 3.16 GET `/api/admin/bank`

Purpose:
- Get bank/UPI list for admin management

Auth:
- Required
- Code comment says admin-only, but role is not enforced in controller

Request:
- Method: `GET`

Success response fields:
- `success`: boolean
- `data`: array

Per item fields:
- `id`: int
- `upi_id`: string
- `qr_image`: string or `null`
- `created_at`: datetime string
- `updated_at`: datetime string
- `qr_url`: string or `null`

Success example:
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "upi_id": "merchant@upi",
      "qr_image": "uploads/qr/qr-1774889467999-179962646.png",
      "created_at": "2026-03-31T08:00:00.000Z",
      "updated_at": "2026-03-31T08:30:00.000Z",
      "qr_url": "http://localhost:5000/uploads/qr/qr-1774889467999-179962646.png"
    }
  ]
}
```

DB read:
- `bank_accounts`

### 3.17 POST `/api/admin/bank`

Purpose:
- Create bank/UPI record with optional QR image

Auth:
- Required
- Code comment says admin-only, but role is not enforced in controller

Request:
- Method: `POST`
- Content-Type: `multipart/form-data`

Form fields:
- `upi_id`: string, required
- `qr_image`: file image, optional, allowed `jpeg | jpg | png | webp`, max 5MB

Success response fields:
- `success`: boolean
- `message`: string
- `data.id`: int
- `data.upi_id`: string
- `data.qr_image`: string or `null`

Success example:
```json
{
  "success": true,
  "message": "Bank detail added",
  "data": {
    "id": 4,
    "upi_id": "merchant@upi",
    "qr_image": "uploads/qr/qr-1774889467999-179962646.png"
  }
}
```

### 3.18 PUT `/api/admin/bank/:id`

Purpose:
- Update bank/UPI record and optionally replace QR image

Auth:
- Required

Path params:
- `id`: int

Request:
- Method: `PUT`
- Content-Type: `multipart/form-data`

Form fields:
- `upi_id`: string, required
- `qr_image`: file image, optional

Success response fields:
- `success`: boolean
- `message`: string
- `data.id`: int or string
- `data.upi_id`: string
- `data.qr_image`: string or `null`

Common errors:
- `400` if `upi_id` missing
- `404` record not found

### 3.19 DELETE `/api/admin/bank/:id`

Purpose:
- Delete bank/UPI record

Auth:
- Required

Path params:
- `id`: int

Success response fields:
- `success`: boolean
- `message`: string

Success example:
```json
{
  "success": true,
  "message": "Bank detail deleted"
}
```

### 3.20 GET `/api/user/getAllUser`

Purpose:
- Admin gets all users with wallet summary and full transaction list

Auth:
- Required
- Admin role required

Request:
- Method: `GET`

Success response fields:
- `success`: boolean
- `count`: int
- `data`: array of user objects

Per user object fields:
- `id`: int
- `Username`: string
- `Phone`: string
- `Role`: enum string `User | Admin`
- `totalCoins`: int
- `totalProfit`: int
- `totalLoss`: int
- `totalWithdrawal`: int
- `transactions`: array

Per nested transaction fields:
- all columns from `transactions`
- plus `upi_id` from `withdrawal_requests`

Success example:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 12,
      "Username": "moham",
      "Phone": "9876543210",
      "Role": "User",
      "totalCoins": 820,
      "totalProfit": 500,
      "totalLoss": 80,
      "totalWithdrawal": 100,
      "transactions": []
    }
  ]
}
```

### 3.21 GET `/api/stats`

Purpose:
- Admin dashboard summary

Auth:
- Required
- Admin role expected

Request:
- Method: `GET`

Success response fields:
- `success`: boolean
- `data.totalUsers`: int
- `data.totalCoins`: int
- `data.totalPendingWithdrawalAmount`: int
- `data.totalRevenue`: int

Success example:
```json
{
  "success": true,
  "data": {
    "totalUsers": 145,
    "totalCoins": 84500,
    "totalPendingWithdrawalAmount": 4200,
    "totalRevenue": 24800
  }
}
```

Notes:
- Non-admin currently gets HTTP `402` in code, not `403`

### 3.22 GET `/api/withdrawal/pending`

Purpose:
- Admin gets only pending withdrawals

Auth:
- Required
- Admin role required

Request:
- Method: `GET`

Success response fields:
- `success`: boolean
- `count`: int
- `data`: array

Per item fields:
- `id`: string UUID
- `user`: string username
- `coins`: int
- `amount`: int
- `status`: string
- `upiId`: string
- `createdAt`: datetime string

Success example:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "abc-uuid",
      "user": "moham",
      "coins": 200,
      "amount": 200,
      "status": "pending",
      "upiId": "name@upi",
      "createdAt": "2026-03-31T10:11:12.000Z"
    }
  ]
}
```

### 3.23 GET `/api/withdrawal`

Purpose:
- Admin gets withdrawals by status or all withdrawals

Auth:
- Required
- Admin role required

Request:
- Method: `GET`

Query params:
- `status`: optional string, allowed `pending | success | failed | all`

Response fields:
- Same as `GET /api/withdrawal/pending`

Used by:
- Admin withdrawal screen filter

### 3.24 PUT `/api/withdrawal/:id/approvereject`

Purpose:
- Admin approves or rejects pending withdrawal

Auth:
- Required
- Admin role required

Path params:
- `id`: string UUID transaction id

Request:
- Method: `PUT`
- Content-Type: `application/json`

Request body fields:
- `status`: enum string, required, allowed `success | failed`
- `remark`: string, optional, mostly used when rejecting

Success response fields:
- `success`: boolean
- `message`: string

Success example:
```json
{
  "success": true,
  "message": "Withdrawal updated successfully"
}
```

Side effects if `status = success`:
- `transactions.status = 'success'`
- `transactions.paid_at = NOW()`
- `withdrawal_requests.status = 'approved'`

Side effects if `status = failed`:
- `transactions.status = 'failed'`
- `transactions.admin_remark = remark || "Rejected by admin"`
- `withdrawal_requests.status = 'rejected'`

## 4. Payment API (`Backend/`)

### 4.1 GET `/health`

Purpose:
- Health check

Auth:
- Not required

Success response:
```json
{
  "status": "ok"
}
```

### 4.2 POST `/api/txn/create`

Purpose:
- Create topup transaction before opening payment page

Auth:
- Not required in current code

Request:
- Method: `POST`
- Content-Type: `application/json`

Request body fields:
- `amount`: number, required
- `coins`: number, required
- `returnUrl`: string, required for redirect-back flow
- `userId`: string or int, optional in code but used by frontend

Validation:
- Code checks `amount >= 1`
- Error message says "Minimum Rs10", but controller currently rejects only `< 1`

Success response fields:
- `success`: boolean
- `txnId`: string UUID
- `expiresAt`: datetime string

Success example:
```json
{
  "success": true,
  "txnId": "3b5cfb6f-1d9f-4ab2-9af2-7cd37e5c42b1",
  "expiresAt": "2026-03-31 22:45:00"
}
```

DB write:
- Inserts into `transactions`
- `type = 'topup'`
- random `bank_id` selected from `bank_accounts`

Common errors:
- `400` invalid amount
- `503` no bank available
- `500` server error

Used by:
- `client/src/components/Deposit.jsx`

### 4.3 GET `/api/txn/:id`

Purpose:
- Get payment transaction detail plus bank detail for payment page

Auth:
- Not required

Path params:
- `id`: string UUID transaction id

Request:
- Method: `GET`

Response shape:
- Current query is `SELECT t.*, b.*`
- So response is a merged object containing:
  - transaction columns from `transactions`
  - bank columns from `bank_accounts`

Transaction-side fields commonly expected:
- `id`
- `user_id`
- `amount`
- `coins`
- `bank_id`
- `status`
- `utr_number`
- `return_url`
- `expires_at`
- `created_at`
- `paid_at`
- `type`
- `screenshot_url`
- `admin_remark`
- `telegram_msg_id`
- `submitted_at`
- `game`

Bank-side fields used by payment frontend:
- `upi_id`
- `qr_image`
- `account_name`
- `account_no`
- `ifsc_code`
- `bank_name`
- `branch`

Example response:
```json
{
  "id": "3b5cfb6f-1d9f-4ab2-9af2-7cd37e5c42b1",
  "user_id": 12,
  "amount": 100,
  "coins": 130,
  "bank_id": 2,
  "status": "pending",
  "return_url": "http://localhost:5173",
  "expires_at": "2026-03-31T17:15:00.000Z",
  "upi_id": "merchant@upi",
  "qr_image": "uploads/qr/qr-1774889467999-179962646.png",
  "account_name": "Merchant Name",
  "account_no": "1234567890",
  "ifsc_code": "SBIN0000123",
  "bank_name": "State Bank",
  "branch": "Delhi"
}
```

Common errors:
- `404` not found

Important note:
- Because query selects both `t.*` and `b.*`, duplicate columns like `id` can collide in response object.

### 4.4 GET `/api/txn/status/:id`

Purpose:
- Legacy status endpoint
- Also updates transaction `user_id` from query param

Auth:
- Not required

Path params:
- `id`: string UUID

Query params:
- `userId`: required string or int

Success response fields:
- `status`: string transaction status only

Success example:
```json
{
  "status": "pending"
}
```

Side effect:
- Updates `transactions.user_id = userId`

Common errors:
- `403` if `userId` missing

Current usage:
- Old deposit-success flow only
- Current frontend has this path commented out

### 4.5 POST `/api/payment/verify`

Purpose:
- Legacy manual UTR verification endpoint

Auth:
- Not required

Request:
- Method: `POST`
- Content-Type: `application/json`

Request body fields:
- `txnId`: string UUID, required
- `utrNumber`: string, required

Success response fields on match:
- `success`: boolean
- `status`: string
- `coins`: int

Success example:
```json
{
  "success": true,
  "status": "success",
  "coins": 130
}
```

No-match example:
```json
{
  "success": false,
  "status": "not_matched"
}
```

Side effect:
- If match found, sets `transactions.status = 'success'`

Current usage:
- Not used by active payment page flow

### 4.6 POST `/api/payment/simulate`

Purpose:
- Dev-only simulate payment success

Auth:
- Not required

Request:
- Method: `POST`
- Content-Type: `application/json`

Request body fields:
- `txnId`: string UUID, required

Success response:
```json
{
  "success": true
}
```

Side effect:
- Sets `transactions.status = 'success'`

Current usage:
- Payment frontend still contains a simulate button handler
- Marked in code as dev-only and should be removed in production

### 4.7 POST `/api/payment/submit-proof`

Purpose:
- User submits payment proof after manual transfer

Auth:
- Not required in current code

Request:
- Method: `POST`
- Content-Type: `multipart/form-data`

Form fields:
- `txnId`: string UUID, required
- `utrNumber`: string, optional
- `userName`: string, optional
- `screenshot`: file image, optional

Validation:
- `txnId` is required
- At least one of `utrNumber` or `screenshot` is required
- file must be image
- max file size 10MB

Success response fields:
- `success`: boolean
- `message`: string

Success example:
```json
{
  "success": true,
  "message": "Proof submit ho gaya. Admin verify karega."
}
```

Common errors:
- `400` missing `txnId`
- `400` if neither screenshot nor UTR given
- `404` transaction not found
- `400` if transaction already `success`, `failed`, or `expired`

Side effects:
- Sets `transactions.status = 'submitted'`
- Sets `transactions.utr_number`
- Sets `transactions.submitted_at`
- Sends proof to Telegram admin
- Saves `transactions.telegram_msg_id` if Telegram send succeeds

### 4.8 POST `/api/payment/telegram-webhook`

Purpose:
- Internal Telegram webhook for admin accept/reject flow

Auth:
- No API auth
- Should only be called by Telegram

Request:
- Method: `POST`
- Content-Type: `application/json`

Request body:
- Telegram update JSON

Response:
- `200` empty success on handled update
- `500` on failure

Internal behavior:
- If admin taps Accept, transaction becomes `success`
- If admin taps Reject, bot asks for reason
- After reason, transaction becomes `failed` and `admin_remark` is saved

### 4.9 GET `/api/payment/result/:txnId`

Purpose:
- Frontend polls for admin approval/rejection result

Auth:
- Not required

Path params:
- `txnId`: string UUID

Success response fields:
- `status`: enum string `pending | submitted | success | failed | expired`
- `remark`: string or `null`
- `coins`: int

Success example:
```json
{
  "status": "success",
  "remark": null,
  "coins": 130
}
```

Reject example:
```json
{
  "status": "failed",
  "remark": "UTR mismatch",
  "coins": 130
}
```

Common errors:
- `404` transaction not found

Used by:
- `Frontend/src/components/PayPage.jsx`

### 4.10 GET `/api/admin/banks`

Purpose:
- Payment backend bank listing

Auth:
- Not required in current code

Request:
- Method: `GET`

Success response:
- Raw array of `bank_accounts` rows

Important note:
- This controller expects extra fields like `account_name`, `bank_name`, `account_no`, `ifsc_code`, `branch`, `daily_limit`, `is_active`, `collected`
- These fields are not present in the schema you shared

### 4.11 POST `/api/admin/banks`

Purpose:
- Payment backend adds bank

Auth:
- Not required in current code

Request:
- Method: `POST`
- Content-Type: `application/json`

Request body fields:
- `account_name`: string
- `upi_id`: string
- `bank_name`: string
- `account_no`: string
- `ifsc_code`: string
- `branch`: string
- `daily_limit`: int, optional, default `100000`

Success response:
```json
{
  "success": true,
  "id": 5
}
```

Common errors:
- `400` UPI ID already exists

### 4.12 PATCH `/api/admin/banks/:id/toggle`

Purpose:
- Toggle bank active status

Auth:
- Not required in current code

Path params:
- `id`: int

Success response:
```json
{
  "success": true
}
```

Side effect:
- `is_active = NOT is_active`

### 4.13 DELETE `/api/admin/banks/:id`

Purpose:
- Delete bank record from payment backend

Auth:
- Not required in current code

Path params:
- `id`: int

Success response:
```json
{
  "success": true
}
```

### 4.14 GET `/api/admin/transactions`

Purpose:
- Get recent payment transactions from payment backend

Auth:
- Not required in current code

Request:
- Method: `GET`

Response:
- Raw array of last 100 joined transaction rows

Joined fields:
- all transaction fields
- `account_name`
- `upi_id`

### 4.15 POST `/api/admin/reset-daily`

Purpose:
- Reset daily collected values for banks

Auth:
- Not required in current code

Success response:
```json
{
  "success": true,
  "message": "Daily limits reset"
}
```

Side effect:
- Updates `bank_accounts.collected = 0`

## 5. Socket.IO Realtime Events

Socket connection:
- Connect to `<VITE_BACKEND_MAIN_URL>`

### 5.1 Event: `multiplier`

Purpose:
- Live aviator multiplier stream

Server emits payload:
- `multiplier`: string, fixed to 2 decimals
- `crashPoint`: number

Example:
```json
{
  "multiplier": "1.42",
  "crashPoint": 3.87
}
```

Used by:
- `client/src/components/Aviator.jsx`

### 5.2 Event: `crash`

Purpose:
- Notify clients that round crashed

Server emits payload:
- number crash point

Example:
```json
3.87
```

Client behavior:
- If user had active bet and no cashout, app saves `loss`
- If user cashes out, app saves `profit`

## 6. DB Table Mapping by API

### 6.1 `users`

Used by:
- register
- login
- checkuser
- auth middleware
- admin user list

Columns actually used in code:
- `id`
- `Username`
- `Password`
- `Role`
- `Phone`

Column in shared schema but not used on register:
- `Email`

### 6.2 `withdrawal_requests`

Used by:
- create withdrawal
- withdrawal history
- admin withdrawal list
- admin approve/reject
- delete withdrawal
- update withdrawal

Columns used:
- `id`
- `user_id`
- `transaction_id`
- `amount`
- `upi_id`
- `status`
- `created_at`

### 6.3 `transactions`

Used almost everywhere:
- wallet balance
- game win/loss save
- withdrawal
- topup creation
- payment proof flow
- admin stats
- admin users

Columns used in code:
- `id`
- `user_id`
- `amount`
- `coins`
- `bank_id`
- `status`
- `utr_number`
- `return_url`
- `expires_at`
- `created_at`
- `paid_at`
- `type`
- `screenshot_url`
- `admin_remark`
- `telegram_msg_id`
- `submitted_at`
- `game`

### 6.4 `coin_packages`

Used by:
- deposit package list
- admin package CRUD

Columns used:
- `id`
- `rupees`
- `coins`
- `bonus`
- `pct`
- `label`
- `tag`
- `popular`

### 6.5 `bank_accounts`

Used by:
- main admin bank CRUD
- payment transaction bank selection
- payment page bank detail display
- payment backend admin bank management

Columns from your shared schema:
- `id`
- `upi_id`
- `created_at`
- `qr_image`
- `updated_at`

Extra columns expected by payment backend code:
- `account_name`
- `bank_name`
- `account_no`
- `ifsc_code`
- `branch`
- `is_active`
- `daily_limit`
- `collected`

## 7. Known Mismatches and Important Notes

1. Register UI vs backend mismatch:
- Frontend sends `email`, `confirm`, `agree`
- Backend saves only `username`, `phone`, `password`
- `users.Email` from your schema is not inserted during register

2. Password validation mismatch:
- Frontend login/register UI accepts minimum 6 chars
- Backend register requires minimum 8 chars

3. Package update mismatch:
- `POST /api/admin/package` expects `{ form: {...} }`
- `PUT /api/admin/package/:id` expects flat fields
- Current frontend sends `{ form: {...} }` for both create and update

4. Payment return mismatch:
- `Frontend/src/components/PaymentReturn.jsx` calls `GET /verify-payment/:orderId`
- No such backend route exists in analyzed code

5. Bank schema mismatch:
- Your shared `bank_accounts` table has only UPI + QR fields
- Payment backend and payment frontend expect extra bank transfer fields such as `account_name`, `account_no`, `ifsc_code`, `bank_name`, `branch`

6. Admin protection gap:
- `server/routers/bank.routes.js` says admin-only in comment
- Actual controller currently only checks auth, not role
- Payment backend admin routes also have no auth middleware

7. `GET /api/checkuser` limitation:
- It reads only cookie token
- Bearer token support exists in `authMiddleware`, but not in this route

8. Withdrawal edit gap:
- `PUT /api/wallet/withdrawal/:txId` does not re-check wallet balance before updating requested coins

9. Payment status endpoint side effect:
- `GET /api/txn/status/:id` is not a pure read
- It updates `transactions.user_id`

10. Transaction detail key collision:
- `GET /api/txn/:id` does `SELECT t.*, b.*`
- duplicate keys like `id` can overwrite each other in response JSON

11. Payment backend schema mismatch inside codebase itself:
- `Backend/config/db.js` creates a simpler `transactions` enum than controllers use
- controllers use statuses like `submitted` and `failed`, but local init schema shown there does not include them

## 8. Suggested Next Improvement

If you want this API layer to become easier to maintain, the next best steps are:
- create one unified backend instead of `server/` plus `Backend/`
- generate a Postman collection from this doc
- convert this into Swagger/OpenAPI JSON
- fix schema mismatches before production rollout
