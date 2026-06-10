# Guide Import Specification

## Purpose

Convert user-provided content into a structured draft:

```text
Guide > Chapters > Sections > Collectibles
```

Collectible types are guide-level records referenced by collectibles.

## Supported Inputs

1. Manual creation with no imported source.
2. Pasted plain text or HTML.
3. Public URL from a supported source, initially PowerPyx.
4. Native JSON import: [Should have].

Importing a URL means fetching only publicly accessible content. The service
must not bypass authentication, paywalls, robots restrictions, CAPTCHAs, or
other technical controls.

The original pasted text or fetched response body is retained unchanged in a
local source snapshot. It is never rendered directly or executed.

## Import Pipeline

```text
submit input
  -> validate input
  -> retain the original source snapshot
  -> normalize a working copy
  -> fetch URL when needed
  -> identify source/parser
  -> extract content
  -> map headings and entries to the domain hierarchy
  -> sanitize text and validate image references
  -> validate draft schema
  -> show preview, confidence, and warnings
  -> user edits and confirms
  -> commit all records in one transaction
```

## Draft Rules

- A draft is never visible as a live guide.
- The preview shows the original source beside parsed results where practical.
- Users can rename, reorder, add, and remove every parsed entity.
- Ambiguous hierarchy is surfaced as a warning, not silently discarded.
- Unclassified collectibles use an `Uncategorized` type in the draft.
- Missing chapters or sections use clearly labeled temporary containers.
- Confirmation commits the whole draft atomically.
- The retained source snapshot remains available for reparsing and diagnostics.

## Parser Architecture

All importers implement a common contract:

```text
can_handle(input) -> confidence
parse(input) -> ImportDraft
```

Initial importers:

- `PastedContentImporter`: semantic headings, lists, and repeated blocks.
- `PowerPyxImporter`: source-specific selectors and transformations.
- `GenericUrlImporter`: [Later], conservative extraction with more warnings.

Parser output must include its parser name and version so imports can be
diagnosed when a source website changes.

## URL Fetching Security

- Permit only `http` and `https`, preferring `https`.
- Resolve DNS and reject loopback, private, link-local, multicast, and cloud
  metadata addresses before every request and redirect.
- Limit redirects, response bytes, request duration, and content types.
- Do not forward user cookies, credentials, or arbitrary headers.
- Rate-limit imports by user and destination host.
- Parse fetched content without browser execution; scripts are treated as inert
  text and never run.
- Sanitize all HTML and never trust remote MIME declarations alone.

## Images

- Extract image URL, caption, alt text, and source page where available.
- Copy approved imported images into local application storage.
- Retain each image's original source URL and attribution metadata.
- There is no count limit per guide, but imports must check available disk
  space and enforce a per-file byte limit.
- Proxying or copying images must enforce byte, dimension, type, and redirect
  limits and strip unsafe metadata.

## Copyright and Attribution

PowerPyx and similar guides are third-party copyrighted works. Supporting an
import format does not grant permission to republish their text or images.

- Require the user to confirm they have permission to use imported content.
- Retain source name, URL, and retrieval date.
- Prefer extracting factual structure and linking to the source.
- Do not present the app as affiliated with a source website.
- Provide a deletion process for improperly imported shared content.
- Review source terms and robots policy before enabling production URL import.

## Failure Handling

| Failure | Behavior |
| --- | --- |
| Unsupported URL | Explain supported sources; offer paste/manual entry |
| Fetch blocked or timed out | Preserve input and allow retry |
| Parser finds no items | Do not create a guide; show diagnostics |
| Partial parse | Show draft with warnings and omitted-content count |
| Validation failure | Point to invalid draft records |
| Commit failure | Roll back all live records; preserve the draft |

## Open Decisions

- Parsing is deterministic only in the first release.
- Imports execute in the API process without a separate task queue. The UI
  observes durable import-job stages through polling or server-sent events.
- Raw pasted and fetched source documents are retained until their import job
  is explicitly deleted.
- Which specific PowerPyx guide layouts form the initial compatibility suite?
