# Question Bank

Comprehensive question repository with filtering, search, and management capabilities

## Version

1.0.0

## Category

content

## Permissions

- `question-bank:view` - View questions
- `question-bank:create` - Create questions
- `question-bank:edit` - Edit questions
- `question-bank:delete` - Delete questions

## API Routes

- `GET /api/question-bank`
- `POST /api/question-bank`
- `GET /api/question-bank/:id`
- `PUT /api/question-bank/:id`
- `DELETE /api/question-bank/:id`

## Navigation

- Question Bank (`/app/question-bank`)

## Configuration

See `config.schema.ts` for configuration options.

## Installation

```bash
POST /api/admin/plugins/question-bank/install
POST /api/admin/plugins/question-bank/enable
```
