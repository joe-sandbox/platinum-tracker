import type { FormEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";

export const fieldClassName =
  "mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20";

export const textAreaClassName =
  "mt-1.5 min-h-24 w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20";

type CrudFormProps = {
  title: string;
  children: ReactNode;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CrudForm({
  title,
  children,
  isSaving,
  onCancel,
  onSubmit,
}: CrudFormProps) {
  return (
    <form
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6"
      onSubmit={onSubmit}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
