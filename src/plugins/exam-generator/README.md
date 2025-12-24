# AI Exam Generator

Generate full-length exams based on templates with real-time exam sessions

## Version

1.0.0

## Category

assessment

## Permissions

None

## API Routes

- `POST /api/exams/generate`
- `GET /api/exams/:id`
- `POST /api/exams/:id/start`
- `PUT /api/exams/sessions/:sessionId`
- `POST /api/exams/sessions/:sessionId/submit`

## Navigation

- Full Exams (`/app/exams`)

## Configuration

See `config.schema.ts` for configuration options.

## Installation

```bash
POST /api/admin/plugins/exam-generator/install
POST /api/admin/plugins/exam-generator/enable
```
