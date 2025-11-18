# CMS Drag & Drop Implementation

## Related Documentation

- [High Priority Features](./high-priority.md) - CMS implementation details

## Overview

Added drag-and-drop (DnD) functionality to the CMS for reordering pages and FAQs. This allows admins to easily change the display order of content by dragging items.

## Features

✅ **Drag-and-Drop Reordering**
- Drag items to reorder them
- Visual feedback during dragging (opacity change)
- Grip handle icon for better UX
- Optimistic UI updates
- Automatic database sync

✅ **Reusable DnD Module**
- Generic `DndSortableList` component
- Works with any list of items that have an `id` field
- Customizable rendering
- Keyboard accessible

✅ **Database Integration**
- Added `order` field to `Page` model
- Uses existing `order` field in `Faq` model
- Transaction-based updates for reliability
- Automatic ordering in queries

## Implementation Details

### 1. Database Schema

**Updated `Page` model:**
```prisma
model Page {
  // ... existing fields
  order       Int      @default(0) // For drag-and-drop ordering
  // ... 
  @@index([order])
}
```

**Note:** `Faq` model already had an `order` field.

### 2. DnD Component Module

**File:** `src/components/admin/cms/dnd-sortable-list.tsx`

A reusable drag-and-drop component built with `@dnd-kit`:
- `DndSortableList` - Main component
- `SortableItem` - Individual draggable item
- Supports pointer and keyboard interactions
- Visual feedback during drag

**Features:**
- Generic TypeScript support for any item type
- Customizable rendering via `renderItem` prop
- Styling via `className` and `itemClassName` props
- Automatic collision detection
- Smooth animations

### 3. API Routes

**New Route:** `POST /api/admin/cms/reorder`

Updates the order of CMS items:
- Supports: `pages`, `faqs`, `announcements`, `banners`
- Uses Prisma transactions for atomic updates
- Validates input with Zod

**Updated Routes:**
- `GET /api/admin/cms/pages` - Now orders by `order` field
- `POST /api/admin/cms/pages` - Auto-assigns order for new pages
- `PATCH /api/admin/cms/pages/[id]` - Supports updating order

### 4. UI Integration

**Pages Manager:**
- Integrated `DndSortableList` component
- Added `handleReorder` function
- Shows drag handle (grip icon) on each item
- Optimistic UI updates with error handling

**FAQs Manager:**
- Integrated `DndSortableList` component
- Added `handleReorder` function
- Maintains existing order field functionality

## Usage

### For Admins

1. Navigate to `/admin/cms`
2. Go to "Pages" or "FAQs" tab
3. Click and hold the grip icon (⋮⋮) on any item
4. Drag to desired position
5. Release to save new order
6. Order is automatically saved to database

### For Developers

**Using the DnD Component:**

```tsx
import { DndSortableList } from "@/components/admin/cms/dnd-sortable-list";

<DndSortableList
  items={items.sort((a, b) => a.order - b.order)}
  onReorder={handleReorder}
  className="space-y-2"
  itemClassName="p-3 border rounded-lg"
  renderItem={(item) => (
    <div>
      {/* Your item content */}
    </div>
  )}
/>
```

**Implementing handleReorder:**

```tsx
const handleReorder = async (newOrder: Item[]) => {
  try {
    // Optimistically update UI
    setItems(newOrder);

    // Update database
    const response = await fetch("/api/admin/cms/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "pages", // or "faqs", "announcements", "banners"
        items: newOrder.map((item, index) => ({
          id: item.id,
          order: index,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to reorder");
    }

    toast.success("Order updated");
  } catch (error) {
    toast.error("Failed to reorder");
    fetchItems(); // Revert on error
  }
};
```

## Dependencies

**Added:**
- `@dnd-kit/core` - Core DnD functionality
- `@dnd-kit/sortable` - Sortable list utilities
- `@dnd-kit/utilities` - Helper utilities

## Database Migration

Run the following to apply schema changes:

```bash
npx prisma generate
npx prisma db push
```

Or create a migration:

```bash
npx prisma migrate dev --name add_page_order_field
```

## Future Enhancements

- [ ] Add DnD to Announcements manager
- [ ] Add DnD to Banners manager
- [ ] Add visual indicators for drag zones
- [ ] Add undo/redo functionality
- [ ] Add bulk reordering
- [ ] Add category-based ordering for FAQs

## Notes

- The DnD component is fully accessible with keyboard support
- Order updates are atomic (transaction-based)
- UI updates optimistically for better UX
- Errors automatically revert to previous state
- Order field defaults to 0 for existing items

