# Razorpay Admin Management

## Related Documentation

- [High Priority Features](./high-priority.md) - Payment integration details

## Overview

Razorpay payment gateway credentials are now managed through the Admin Panel instead of environment variables. This provides:

- **Flexibility**: Update credentials without redeploying
- **Security**: Encrypted storage using AES-256-CBC
- **Environment Support**: Separate test and production configurations
- **Easy Management**: Admin UI for configuration

## Database Model

**PaymentConfig** model stores encrypted credentials:
- `provider`: Payment provider (default: "razorpay")
- `keyId`: Encrypted Razorpay Key ID
- `keySecret`: Encrypted Razorpay Key Secret
- `isActive`: Enable/disable payment gateway
- `environment`: "test" or "production"

## Admin Panel Access

1. Navigate to `/admin/payment-config`
2. Enter Razorpay credentials:
   - Key ID (e.g., `rzp_test_...`)
   - Key Secret
   - Environment (Test/Production)
   - Status (Active/Inactive)
3. Click "Save Configuration"

## Security Features

- **Encryption**: Keys are encrypted using AES-256-CBC before storage
- **No Display**: Key secret is never displayed after saving
- **Secure Retrieval**: Keys are decrypted only when needed for API calls

## API Integration

Payment API routes automatically use database configuration:
- `/api/subscription/create-order` - Creates Razorpay orders
- `/api/subscription/verify-payment` - Verifies payment signatures
- `/api/subscription/upgrade` - Checks payment configuration

**Fallback**: If no database configuration exists, the system falls back to environment variables (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`) for backward compatibility.

## Migration

1. **Run database migration**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Configure via Admin Panel**:
   - Login as admin
   - Go to Admin Panel > Payment Config
   - Enter Razorpay credentials
   - Save configuration

3. **Optional**: Remove Razorpay credentials from `.env` file (they're now optional fallback)

## Benefits

✅ **No Redeployment**: Update credentials without code changes
✅ **Secure Storage**: Encrypted at rest
✅ **Environment Separation**: Test and production configs
✅ **Easy Management**: User-friendly admin interface
✅ **Backward Compatible**: Falls back to env vars if needed

