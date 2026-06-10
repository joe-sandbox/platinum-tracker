# UX Specification

## Experience Goals

- Primary device: Desktop for setup, editing, and imports.
- Secondary device: Mobile browser on the same computer/network is later scope;
  tracking remains responsive from the start.
- Visual tone: [TODO]
- Reference products or screenshots: [TODO]

## Information Architecture

Proposed structure; rename or remove levels that do not fit the game:

```text
Game
|-- Dashboard
|-- Guides
|   `-- Guide
|       |-- Chapter
|       |   `-- Section
|       |       `-- Collectible
|       `-- Guide editor
|-- Import guide
`-- Settings / data management
```

Final navigation:

- Dashboard
- Games
- Guides
- Import
- Settings

Desktop uses a persistent left sidebar with the current game context. Small
viewports use a fixed bottom navigation bar with the same destinations.

## Core Screens

| Screen | Purpose | Required Content | Primary Action |
| --- | --- | --- | --- |
| Dashboard | Summarize progress | [TODO] | [TODO] |
| Game library | Browse and manage games | Cards, progress | Add game |
| Guide view | Track a guide | Tree, filters, totals | Update status |
| Guide editor | Manage guide hierarchy | Outline and forms | Save changes |
| Import wizard | Parse and review content | Source, preview, warnings | Confirm import |
| Collectible detail | Show guidance and images | Status, text, gallery | Update status |
| Settings | Manage preferences and data | [TODO] | [TODO] |

## Key Flows

### First Visit

1. Explain that all data, images, and imported source snapshots remain local.
2. Offer to add a first game manually or import a guide.
3. Land on the game library.

### Mark an Item Complete

1. User locates an item by browsing, searching, or filtering.
2. User activates the completion control.
3. UI updates optimistically and displays a brief saving state.
4. On failure, the previous status is restored and a retry message is shown.

### Import a Guide

1. User selects a game and chooses paste or URL import.
2. User supplies content and confirms they have permission to use it.
3. The app shows the current stage, such as saving source, fetching, parsing,
   validating, or preparing preview.
4. The review screen presents a collapsible chapter/section tree, detected
   collectible types, image references, warnings, and source attribution.
5. User edits, reorders, removes, or adds draft content.
6. User confirms; the app commits the guide atomically and opens it.

### Resume a Session

1. [TODO]
2. [TODO]

### Reset or Delete Progress

1. [TODO: Include confirmation and explain scope.]
2. [TODO]

## Filtering and Sorting

- Search fields: [TODO]
- Filter dimensions: status, type, chapter, and section.
- Default sort: [TODO]
- Available sorts: [TODO]
- Are filters preserved between visits? [TODO]
- How `collected` items appear: Visually subdued but readable; optionally
  hidden.

## Responsive Behavior

- Small viewport navigation: Fixed bottom navigation with icons and labels.
- List or card behavior: [TODO]
- Detail presentation: [TODO]
- Large-table alternative on mobile: [TODO]

## UI States

Define each state for every data-driven screen:

- Loading: [TODO]
- No game data: [TODO]
- No player progress: All collectibles appear as `missing`.
- No filter results: [TODO]
- Offline: Explain that the local API is unavailable and preserve unsaved form
  content where practical.
- Save error: [TODO]
- General error: [TODO]
- Fully complete: [TODO]

## Accessibility

- Target standard: WCAG [TODO: recommended 2.2 AA]
- Completion status is not communicated by color alone.
- Interactive targets are large enough for use during gameplay.
- All controls have accessible names and visible focus indicators.
- Dynamic progress updates are announced appropriately.
- Reduced-motion behavior: [TODO]
- Keyboard interaction details: [TODO]

## Visual Tokens

- Color palette: [TODO]
- Typography: [TODO]
- Spacing scale: [TODO]
- Border radius: [TODO]
- Icons: [TODO]
- Dark mode: [Required / Later / Not planned]
