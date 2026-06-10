# Platinum Tracker Web

React frontend for Platinum Tracker.

## Development

```bash
pnpm install
pnpm dev
```

## Quality Checks

```bash
pnpm format
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

Install the Playwright browser once:

```bash
pnpm exec playwright install chromium
```

Run the browser smoke tests:

```bash
pnpm test:e2e
```

## UI Components

Tailwind CSS is configured through the Vite plugin. shadcn/ui components are
stored in `src/components/ui`.

Add another component from this directory:

```bash
pnpm dlx shadcn@latest add <component>
```
