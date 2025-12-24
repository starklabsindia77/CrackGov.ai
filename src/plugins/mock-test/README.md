# Mock Test Generator

AI-powered mock test generation with 20 questions, automatic scoring, and topic-wise analysis

## Version

1.0.0

## Category

assessment

## Permissions

- `mock-test:create` - Generate mock tests
- `mock-test:attempt` - Attempt mock tests
- `mock-test:view` - View test results

## API Routes

- `POST /api/tests/generate`
- `GET /api/tests/:testId`
- `POST /api/tests/:testId/submit`
- `GET /api/test-attempts`

## Navigation

- Mock Tests (`/app/tests`)

## Configuration

See `config.schema.ts` for configuration options.

## Installation

```bash
POST /api/admin/plugins/mock-test/install
POST /api/admin/plugins/mock-test/enable
```
