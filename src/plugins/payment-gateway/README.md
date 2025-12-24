# Payment Gateway

Payment processing with Razorpay integration and subscription management

## Version

1.0.0

## Category

integration

## Permissions

- `payment:manage` - Manage payment configuration

## API Routes

- `POST /api/payment/create-order`
- `POST /api/payment/verify`
- `POST /api/payment/webhook`

## Navigation

None

## Configuration

See `config.schema.ts` for configuration options.

## Installation

```bash
POST /api/admin/plugins/payment-gateway/install
POST /api/admin/plugins/payment-gateway/enable
```
