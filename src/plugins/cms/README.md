# Content Management System

Manage pages, posts, FAQs, announcements, and banners

## Version

1.0.0

## Category

content

## Permissions

- `cms:manage` - Manage CMS content

## API Routes

- `GET /api/cms/pages`
- `POST /api/cms/pages`
- `GET /api/cms/posts`
- `POST /api/cms/posts`
- `GET /api/cms/faqs`
- `GET /api/cms/announcements`
- `GET /api/cms/banners`

## Navigation

None

## Configuration

See `config.schema.ts` for configuration options.

## Installation

```bash
POST /api/admin/plugins/cms/install
POST /api/admin/plugins/cms/enable
```
