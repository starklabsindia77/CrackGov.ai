# Study Groups

Collaborative learning groups with discussions and shared resources

## Version

1.0.0

## Category

collaboration

## Permissions

None

## API Routes

- `POST /api/study-groups`
- `GET /api/study-groups`
- `GET /api/study-groups/:id`
- `POST /api/study-groups/:id/join`
- `POST /api/study-groups/:id/leave`
- `POST /api/study-groups/:id/posts`
- `GET /api/study-groups/:id/posts`

## Navigation

- Study Groups (`/app/groups`)

## Configuration

See `config.schema.ts` for configuration options.

## Installation

```bash
POST /api/admin/plugins/study-groups/install
POST /api/admin/plugins/study-groups/enable
```
