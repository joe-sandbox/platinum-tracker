import { Trophy } from "lucide-react";
import { Outlet } from "react-router-dom";

import { PrimaryNavigation } from "@/components/primary-navigation";

export function AppShell() {
  return (
    <div className="min-h-svh bg-muted/25 text-foreground">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="flex h-20 items-center gap-3 border-b px-6">
          <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Trophy aria-hidden="true" className="size-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">Platinum Tracker</p>
            <p className="text-xs text-muted-foreground">
              Local trophy companion
            </p>
          </div>
        </div>

        <div className="px-4 py-5">
          <p className="px-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Workspace
          </p>
          <PrimaryNavigation className="mt-2" />
        </div>

        <div className="mt-auto border-t p-4">
          <div className="rounded-xl border bg-background/70 p-4 shadow-xs">
            <p className="text-xs font-medium text-muted-foreground">
              Current game
            </p>
            <p className="mt-1 truncate text-sm font-semibold">
              Example Adventure
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              PlayStation 5
            </p>
          </div>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Trophy aria-hidden="true" className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Platinum Tracker</p>
              <p className="text-xs text-muted-foreground">Example Adventure</p>
            </div>
          </div>

          <p className="hidden text-sm text-muted-foreground md:block">
            Example Adventure
            <span aria-hidden="true" className="mx-2 text-border">
              /
            </span>
            Platinum workspace
          </p>

          <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-xs">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-emerald-500"
            />
            Stored locally
          </div>
        </header>

        <main
          className="mx-auto w-full max-w-7xl px-4 py-8 pb-28 sm:px-6 md:px-8 md:pb-10"
          id="main-content"
        >
          <Outlet />
        </main>
      </div>

      <PrimaryNavigation
        aria-label="Mobile navigation"
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border bg-background/95 p-1.5 shadow-lg backdrop-blur md:hidden"
        mobile
      />
    </div>
  );
}
