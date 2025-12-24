# Study Plan Plugin

AI-powered study plan generation plugin for CrackGov.ai.

## Features

- ✅ Generate personalized study plans using AI
- ✅ Customizable based on exam type, target date, and weak areas
- ✅ Caching support for improved performance
- ✅ Event-driven notifications
- ✅ Configurable limits and settings

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `maxPlansPerUser` | number | 10 | Maximum study plans per user |
| `aiProvider` | string | "primary" | AI provider to use |
| `cacheResults` | boolean | true | Enable result caching |
| `cacheTTL` | number | 3600 | Cache TTL in seconds |
| `defaultHoursPerDay` | number | 4 | Default study hours per day |
| `enableNotifications` | boolean | true | Enable notifications |

## API Routes

### POST /api/study-plan/generate

Generate a new study plan.

**Request:**
```json
{
  "exam": "UPSC",
  "targetDate": "2024-12-31",
  "hoursPerDay": 6,
  "weakTopics": ["History", "Geography"]
}
```

**Response:**
```json
{
  "success": true,
  "studyPlan": {
    "id": "...",
    "exam": "UPSC",
    "planData": {...}
  }
}
```

### GET /api/study-plan

List all study plans for the authenticated user.

### GET /api/study-plan/:id

Get a specific study plan.

### DELETE /api/study-plan/:id

Delete a study plan.

## Events

- `study-plan:created` - Emitted when a new plan is created

## Permissions

- `study-plan:create` - Create new study plans
- `study-plan:view` - View study plans
- `study-plan:delete` - Delete study plans

## Dependencies

- Core >= 1.0.0

## Optional Plugins

- `mock-test` - Integrate mock test scheduling
- `flashcard` - Generate flashcards from study plan topics
