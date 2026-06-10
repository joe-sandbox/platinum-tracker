# Product Specification

## Document Control

- Owner: [TODO]
- Status: Draft
- Last updated: 2026-06-10
- Target release: [TODO]

## Product Summary

Platinum Tracker is a website where users can add games, build one or more
structured guides for each game, and track collectibles toward a platinum
trophy.

Guide content follows this hierarchy:

```text
Game > Guide > Chapter > Section > Collectible
```

Each guide can define multiple collectible types, such as weapons, documents,
or upgrades.

## Problem

Existing trophy guides are useful for reading but are often not interactive.
Players must remember progress, maintain a separate checklist, or repeatedly
scan long pages. Creating a tracker manually is also time-consuming because
guide content must be reorganized into chapters, sections, and collectible
records.

## Target User

- Primary user: A player pursuing platinum trophies.
- Secondary user: A guide creator organizing collectible data.
- Initial deployment: A single user running the server on their own computer.
- When they use the tracker: During play and while preparing a guide.
- Devices they are likely to use: Desktop for guide creation; phone, tablet,
  or desktop while playing.
- Accessibility or localization needs: [TODO]

## Goals

1. Create and manage multiple games and guides.
2. Organize collectibles by chapter, section, and collectible type.
3. Record collectible status quickly and see progress at every hierarchy level.
4. Generate a draft guide from pasted content or an imported URL.
5. Allow users to review and correct imported content before saving it.

## Non-Goals

- Guaranteeing successful import from every guide website.
- Circumventing paywalls, authentication, bot protection, or access controls.
- Republishing copyrighted text or images without permission.
- Automatically publishing an import without user review.

## Success Measures

| Measure | Target | How It Is Measured |
| --- | --- | --- |
| [TODO] | [TODO] | [TODO] |
| [TODO] | [TODO] | [TODO] |

## Scope

### Must Have

- [ ] Add, edit, and delete games.
- [ ] Add, edit, and delete guides within a game.
- [ ] Manage chapters, sections, collectible types, and collectibles.
- [ ] Preserve the `game > guide > chapter > section > collectible` hierarchy.
- [ ] Reorder chapters, sections, collectible types, and collectibles.
- [ ] Attach multiple images to a collectible.
- [ ] Set a collectible status to `collected`, `not_found`, or `missing`;
  `missing` is the default.
- [ ] Show completed counts and percentages.
- [ ] Preserve progress between sessions.
- [ ] Search and filter by text, status, type, chapter, and section.
- [ ] Create a guide manually.
- [ ] Parse pasted guide content into a reviewable draft.
- [ ] Import a supported public URL into a reviewable draft.
- [ ] Preserve source attribution for imported content.

### Should Have

- [ ] Edit imported content before saving.
- [ ] Notes for a collectible.
- [ ] Hide completed items.
- [ ] Export and import guide data in the app's native format.
- [ ] Retry or partially repair failed imports.

### Later

- [ ] Multiple save files or playthroughs.
- [ ] User accounts and cloud synchronization.
- [ ] Sharing progress.
- [ ] Collaborative guide editing.
- [ ] AI-assisted parsing for unsupported page layouts.

## Core User Stories

### View Progress

As a player, I want to see my completion status so that I know what remains.

Acceptance criteria:

- [ ] The page shows completed, total, and percentage values.
- [ ] Counts update immediately after a progress change.
- [ ] A fully complete scope is clearly identified.
- [ ] [TODO]

### Record Progress

As a player, I want to mark an item complete so that the tracker reflects my
game state.

Acceptance criteria:

- [ ] The control clearly presents all three statuses.
- [ ] The change persists after refresh.
- [ ] Repeated interaction does not create duplicate records.
- [ ] A failed save is visible and recoverable.
- [ ] [TODO]

### Create a Guide

As a user, I want to create a guide manually so that I can track a game even
when no import source is available.

Acceptance criteria:

- [ ] A guide belongs to exactly one game.
- [ ] Chapters, sections, types, and collectibles can be added and reordered.
- [ ] Validation errors identify the affected field.
- [ ] Leaving with unsaved edits triggers a warning.

### Import a Guide

As a user, I want to paste guide content or provide a public URL so that I do
not need to enter every collectible manually.

Acceptance criteria:

- [ ] The import records its source type and source URL when applicable.
- [ ] Parsed chapters, sections, types, collectibles, descriptions, and image
  references appear in a draft preview.
- [ ] Parsing warnings and omitted content are visible.
- [ ] The user can edit, remove, reorder, or add records in the draft.
- [ ] No guide records are committed until the user confirms the draft.
- [ ] A failed import does not create a partial live guide.
- [ ] Unsupported or blocked URLs fail with a useful message.

### Find Remaining Items

As a player, I want to filter incomplete items so that I can decide what to do
next.

Acceptance criteria:

- [ ] Filters can be combined as defined in the UX specification.
- [ ] The result count is visible.
- [ ] An empty result explains how to clear filters.
- [ ] [TODO]

## Content Requirements

For each tracked item, decide whether the product needs:

- Title: Required
- Description or hint: Optional
- Collectible type: Required
- Chapter: Required
- Section: Required
- Images: Optional; zero or more
- Status: Required; defaults to `missing`
- Region or location: Optional
- Map or coordinates: [Required / Optional]
- Related trophy: [Required / Optional]
- Missable flag: [Required / Optional]
- Prerequisites: [Required / Optional]
- Source and verification date: Required for imported content

Users are responsible for having permission to import and use third-party
content. The product must retain attribution and should prefer short factual
data and links over copying full guide text or externally hosted images.

## Risks and Open Questions

- Guide records and progress are local to the single installation.
- `missing` means the user has not marked the collectible yet and is the
  default state.
- `not_found` means the user actively looked for the collectible but could not
  find it.
- Images are copied into local application storage.
- [TODO: Which PowerPyx page layouts are supported in the first release?]
- [TODO: Is any content missable or tied to a specific playthrough?]
- [TODO: How will game updates or DLC affect totals?]
- [TODO: Does DLC count toward the displayed platinum percentage?]
- [TODO]
