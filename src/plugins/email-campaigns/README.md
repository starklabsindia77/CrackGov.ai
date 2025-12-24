# Email Campaigns

Email marketing with user segmentation and campaign analytics

## Version

1.0.0

## Category

integration

## Permissions

- `email-campaigns:manage` - Manage email campaigns

## API Routes

- `GET /api/email-campaigns`
- `POST /api/email-campaigns`
- `POST /api/email-campaigns/:id/send`
- `GET /api/email-campaigns/:id/stats`

## Navigation

None

## Configuration

See `config.schema.ts` for configuration options.

## Installation

```bash
POST /api/admin/plugins/email-campaigns/install
POST /api/admin/plugins/email-campaigns/enable
```
