# Notification System

Real-time notification system with multiple channels and preferences

## Version

1.0.0

## Category

core

## Permissions

- `notifications:view` - View notifications
- `notifications:manage` - Manage notification preferences

## API Routes

- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`
- `GET /api/notifications/preferences`
- `PUT /api/notifications/preferences`

## Navigation

None

## Configuration

See `config.schema.ts` for configuration options.

## Installation

```bash
POST /api/admin/plugins/notifications/install
POST /api/admin/plugins/notifications/enable
```
