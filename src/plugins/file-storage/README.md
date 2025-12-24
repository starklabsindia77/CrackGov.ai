# File Storage

File upload and storage with AWS S3 and Cloudflare R2 support

## Version

1.0.0

## Category

integration

## Permissions

- `storage:upload` - Upload files

## API Routes

- `POST /api/storage/upload`
- `GET /api/storage/presigned-url`
- `DELETE /api/storage/:key`

## Navigation

None

## Configuration

See `config.schema.ts` for configuration options.

## Installation

```bash
POST /api/admin/plugins/file-storage/install
POST /api/admin/plugins/file-storage/enable
```
