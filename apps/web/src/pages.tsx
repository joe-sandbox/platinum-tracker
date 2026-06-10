import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  CircleDashed,
  Gamepad2,
  Image,
  Import,
  Plus,
  Settings,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}

type PlaceholderCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function PlaceholderCard({ icon, title, description }: PlaceholderCardProps) {
  return (
    <section className="rounded-2xl border bg-card p-6 text-card-foreground shadow-xs">
      <div className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <h2 className="mt-5 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </section>
  );
}

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        action={
          <Button asChild size="lg">
            <Link to="/guides">
              Open guide
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Link>
          </Button>
        }
        description="Your local overview for games, guides, and collectible progress."
        eyebrow="Example Adventure"
        title="Dashboard"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard
          description="One locally stored game is ready for guide creation."
          icon={<Gamepad2 aria-hidden="true" className="size-5" />}
          title="1 game"
        />
        <PlaceholderCard
          description="The starter platinum guide is ready to be expanded."
          icon={<BookOpen aria-hidden="true" className="size-5" />}
          title="1 guide"
        />
        <PlaceholderCard
          description="Progress tracking will begin when collectibles are added."
          icon={<Trophy aria-hidden="true" className="size-5" />}
          title="0% complete"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="font-semibold">Continue building</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Example Adventure Platinum Guide
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Starter
          </span>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <div>
            <p className="text-2xl font-semibold">0</p>
            <p className="text-sm text-muted-foreground">Chapters</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">0</p>
            <p className="text-sm text-muted-foreground">Sections</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">0</p>
            <p className="text-sm text-muted-foreground">Collectibles</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function GamesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        action={
          <Button size="lg">
            <Plus aria-hidden="true" data-icon="inline-start" />
            Add game
          </Button>
        }
        description="Manage the games available in this local installation."
        eyebrow="Library"
        title="Games"
      />
      <PlaceholderCard
        description="The initial fixture is available. Game creation and editing arrive in the next feature."
        icon={<Gamepad2 aria-hidden="true" className="size-5" />}
        title="Example Adventure"
      />
    </div>
  );
}

export function GuidesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        action={
          <Button size="lg">
            <Plus aria-hidden="true" data-icon="inline-start" />
            Add guide
          </Button>
        }
        description="Create and organize platinum guides for the selected game."
        eyebrow="Example Adventure"
        title="Guides"
      />
      <PlaceholderCard
        description="Add chapters, sections, collectible types, and collectibles when the guide editor is implemented."
        icon={<BookOpen aria-hidden="true" className="size-5" />}
        title="Example Adventure Platinum Guide"
      />
    </div>
  );
}

export function ImportPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Create a reviewable guide draft from pasted content or a supported public URL."
        eyebrow="Guide tools"
        title="Import guide"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <PlaceholderCard
          description="Paste plain text or HTML and review the detected guide structure."
          icon={<CircleDashed aria-hidden="true" className="size-5" />}
          title="Paste content"
        />
        <PlaceholderCard
          description="Fetch a supported page while retaining its original source snapshot."
          icon={<Import aria-hidden="true" className="size-5" />}
          title="Import from URL"
        />
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Review local storage, backups, and application preferences."
        eyebrow="Local application"
        title="Settings"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <PlaceholderCard
          description="Database, imported sources, and uploaded images remain on this computer."
          icon={<Settings aria-hidden="true" className="size-5" />}
          title="Local storage"
        />
        <PlaceholderCard
          description="Image management and backup controls will appear here."
          icon={<Image aria-hidden="true" className="size-5" />}
          title="Media and backups"
        />
      </div>
    </div>
  );
}
