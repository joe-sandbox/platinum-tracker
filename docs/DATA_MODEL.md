# Data Model

## Modeling Decisions

- Multiple games and guides are required in the first release.
- Content and progress are separate concerns.
- Guide content is ordered explicitly with integer `position` fields.
- Imported content is staged in an import draft before it becomes live data.
- IDs are stable UUIDs and are never derived from titles.
- SQLite is the source of truth for structured data.
- The initial release is single-user and has no accounts or ownership columns.
- Images and raw import sources are stored in local application directories.

## Content Entities

### Game

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | Primary key |
| title | string | Yes | |
| platform | string | No | |
| edition | string | No | |
| coverImageUrl | URL | No | |
| createdAt | timestamp | Yes | UTC |
| updatedAt | timestamp | Yes | UTC |

### Guide

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | |
| gameId | UUID | Yes | Parent game |
| title | string | Yes | |
| description | text | No | |
| sourceUrl | URL | No | Attribution for imported guides |
| sourceName | string | No | For example, PowerPyx |
| sourceRetrievedAt | timestamp | No | |
| createdAt | timestamp | Yes | |
| updatedAt | timestamp | Yes | |

### Chapter

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | |
| guideId | UUID | Yes | |
| title | string | Yes | |
| description | text | No | |
| position | integer | Yes | Unique within guide |

### Section

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | |
| chapterId | UUID | Yes | |
| title | string | Yes | |
| description | text | No | |
| position | integer | Yes | Unique within chapter |

### CollectibleType

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | |
| guideId | UUID | Yes | Types are guide-specific |
| name | string | Yes | For example, Weapon |
| color | string | No | Validated display token |
| icon | string | No | Key from an approved icon set |
| position | integer | Yes | |

### Collectible

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | |
| sectionId | UUID | Yes | Determines chapter and guide |
| collectibleTypeId | UUID | Yes | Must belong to same guide |
| title | string | Yes | |
| description | sanitized rich text | No | Imported HTML is untrusted |
| position | integer | Yes | Unique within section |
| sourceUrl | URL | No | Optional item-level attribution |
| createdAt | timestamp | Yes | |
| updatedAt | timestamp | Yes | |

### CollectibleImage

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | |
| collectibleId | UUID | Yes | |
| storagePath | string | Yes | Relative path under local media directory |
| altText | string | No | Required before public sharing |
| caption | string | No | |
| sourceUrl | URL | No | Attribution or original image |
| position | integer | Yes | |

## Progress Entities

### CollectibleProgress

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | |
| collectibleId | UUID | Yes | |
| playthroughId | UUID | No | Later unless promoted to v1 |
| status | enum | Yes | `collected`, `not_found`, `missing` |
| note | text | No | |
| statusChangedAt | timestamp | Yes | |
| updatedAt | timestamp | Yes | |

Status semantics:

- `collected`: The user obtained the collectible.
- `missing`: Default state; the user has not marked the collectible.
- `not_found`: The user looked for the collectible but could not find it.

## Import Entities

### ImportJob

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID | Yes | |
| gameId | UUID | Yes | Target game |
| inputType | enum | Yes | `paste`, `url`, `native_file` |
| sourceUrl | URL | No | Required for URL imports |
| rawSourcePath | string | Yes | Retained source snapshot on local disk |
| rawContentType | string | Yes | Plain text or original response type |
| status | enum | Yes | See lifecycle below |
| parser | string | No | Parser and version used |
| warnings | JSON array | Yes | Defaults to empty |
| errorCode | string | No | Stable machine-readable code |
| createdAt | timestamp | Yes | |
| completedAt | timestamp | No | |

The draft payload uses the same hierarchy as live content but remains isolated
until confirmation. Initial implementation may store it as versioned JSON;
normalizing draft tables is only necessary if editing or size makes JSON
impractical.

Import job lifecycle:

```text
pending -> fetching -> parsing -> review_ready -> committing -> committed
                    \-> failed              \-> failed
```

A user may cancel any non-terminal job. Terminal states are `committed`,
`failed`, and `cancelled`.

## Relationships

```text
Game 1--* Guide
Guide 1--* Chapter
Chapter 1--* Section
Guide 1--* CollectibleType
Section 1--* Collectible
CollectibleType 1--* Collectible
Collectible 1--* CollectibleImage
Collectible 1--* CollectibleProgress
Game 1--* ImportJob
```

## Progress Rules

- Only `collected` counts as complete.
- Completion percentage is `collected / total * 100`.
- Totals are available for guide, chapter, section, and collectible type.
- Empty scopes display `0%`; they do not count as completed.
- Percentages are displayed as whole numbers but raw counts remain visible.
- Changing guide content recalculates totals without deleting progress.

## Integrity Rules

- Every chapter has one guide; every section has one chapter.
- A collectible's type must belong to the collectible's guide.
- Positions are non-negative and unique within their parent.
- One progress record exists per playthrough and collectible.
- Deleting a parent requires explicit confirmation and cascades its content.
- Import failures never mutate live guide content.
- Imported rich text is sanitized before preview and persistence.

## Open Decisions

- Database: SQLite managed through SQLAlchemy and Alembic.
- Ownership and sharing: Single local user; no authentication in v1.
- Images: Copied to local storage and referenced by relative path.
- Raw pasted or downloaded import content is retained unchanged as a source
  snapshot; parsed and displayed HTML is always sanitized.
- No application-level limit on images per guide. Per-file upload and total
  available-disk safeguards are still required.
- Soft deletion and restore window: [TODO]
- Maximum individual image and import-source sizes: [TODO]
