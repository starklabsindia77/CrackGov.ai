# Flashcard System

Spaced repetition flashcard system with AI-generated cards and progress tracking

## Version

1.0.0

## Category

core

## Permissions

- `flashcard:create` - Create flashcards
- `flashcard:review` - Review flashcards
- `flashcard:manage` - Manage flashcards

## API Routes

- `POST /api/flashcards`
- `GET /api/flashcards`
- `GET /api/flashcards/due`
- `POST /api/flashcards/:id/review`

## Navigation

- Flashcards (`/app/flashcards`)

## Configuration

See `config.schema.ts` for configuration options.

## Installation

```bash
POST /api/admin/plugins/flashcard/install
POST /api/admin/plugins/flashcard/enable
```
