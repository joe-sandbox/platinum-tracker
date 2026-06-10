import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BookOpen, Gamepad2, Pencil, Plus, Trash2 } from "lucide-react";

import {
  api,
  type Game,
  type GameInput,
  type Guide,
  type GuideInput,
} from "@/api";
import {
  CrudForm,
  fieldClassName,
  textAreaClassName,
} from "@/components/crud-form";
import { Button } from "@/components/ui/button";
import { PageHeader, PlaceholderCard } from "@/pages";

const emptyGame: GameInput = {
  title: "",
  platform: null,
  edition: null,
  cover_image_url: null,
};

const emptyGuide: GuideInput = {
  game_id: "",
  title: "",
  description: null,
  source_url: null,
  source_name: null,
};

function optional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      {message}
    </div>
  );
}

export function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [form, setForm] = useState<GameInput>(emptyGame);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadGames() {
    setIsLoading(true);
    setError(null);
    try {
      setGames(await api.listGames());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load games",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadGames();
  }, []);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyGame);
    setIsFormOpen(true);
  }

  function openEditForm(game: Game) {
    setEditingId(game.id);
    setForm({
      title: game.title,
      platform: game.platform,
      edition: game.edition,
      cover_image_url: game.cover_image_url,
    });
    setIsFormOpen(true);
  }

  async function saveGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        platform: optional(form.platform ?? ""),
        edition: optional(form.edition ?? ""),
        cover_image_url: optional(form.cover_image_url ?? ""),
      };
      if (editingId) {
        await api.updateGame(editingId, payload);
      } else {
        await api.createGame(payload);
      }
      setIsFormOpen(false);
      await loadGames();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save game",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteGame(game: Game) {
    if (!window.confirm(`Delete "${game.title}" and all of its guides?`)) {
      return;
    }
    setError(null);
    try {
      await api.deleteGame(game.id);
      await loadGames();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete game",
      );
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        action={
          <Button onClick={openCreateForm} size="lg">
            <Plus aria-hidden="true" data-icon="inline-start" />
            Add game
          </Button>
        }
        description="Manage the games available in this local installation."
        eyebrow="Library"
        title="Games"
      />

      {error && <ErrorNotice message={error} />}

      {isFormOpen && (
        <CrudForm
          isSaving={isSaving}
          onCancel={() => setIsFormOpen(false)}
          onSubmit={saveGame}
          title={editingId ? "Edit game" : "Add game"}
        >
          <label className="sm:col-span-2">
            <span className="text-sm font-medium">Title</span>
            <input
              autoFocus
              className={fieldClassName}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
              value={form.title}
            />
          </label>
          <label>
            <span className="text-sm font-medium">Platform</span>
            <input
              className={fieldClassName}
              maxLength={100}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  platform: event.target.value,
                }))
              }
              value={form.platform ?? ""}
            />
          </label>
          <label>
            <span className="text-sm font-medium">Edition</span>
            <input
              className={fieldClassName}
              maxLength={100}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  edition: event.target.value,
                }))
              }
              value={form.edition ?? ""}
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium">Cover image URL</span>
            <input
              className={fieldClassName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  cover_image_url: event.target.value,
                }))
              }
              type="url"
              value={form.cover_image_url ?? ""}
            />
          </label>
        </CrudForm>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading games...</p>
      ) : games.length === 0 ? (
        <PlaceholderCard
          description="Add your first game to begin creating a platinum guide."
          icon={<Gamepad2 aria-hidden="true" className="size-5" />}
          title="No games yet"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {games.map((game) => (
            <article
              className="rounded-2xl border bg-card p-6 shadow-xs"
              key={game.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{game.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[game.platform, game.edition]
                      .filter(Boolean)
                      .join(" · ") || "Platform not specified"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    aria-label={`Edit ${game.title}`}
                    onClick={() => openEditForm(game)}
                    size="icon"
                    variant="outline"
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button
                    aria-label={`Delete ${game.title}`}
                    onClick={() => void deleteGame(game)}
                    size="icon"
                    variant="destructive"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function GuidesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [form, setForm] = useState<GuideInput>(emptyGuide);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gameNames = useMemo(
    () => new Map(games.map((game) => [game.id, game.title])),
    [games],
  );

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const [gameData, guideData] = await Promise.all([
        api.listGames(),
        api.listGuides(),
      ]);
      setGames(gameData);
      setGuides(guideData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load guides",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...emptyGuide, game_id: games[0]?.id ?? "" });
    setIsFormOpen(true);
  }

  function openEditForm(guide: Guide) {
    setEditingId(guide.id);
    setForm({
      game_id: guide.game_id,
      title: guide.title,
      description: guide.description,
      source_url: guide.source_url,
      source_name: guide.source_name,
    });
    setIsFormOpen(true);
  }

  async function saveGuide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: optional(form.description ?? ""),
        source_url: optional(form.source_url ?? ""),
        source_name: optional(form.source_name ?? ""),
      };
      if (editingId) {
        await api.updateGuide(editingId, payload);
      } else {
        await api.createGuide(payload);
      }
      setIsFormOpen(false);
      await loadData();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save guide",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteGuide(guide: Guide) {
    if (!window.confirm(`Delete "${guide.title}"?`)) {
      return;
    }
    setError(null);
    try {
      await api.deleteGuide(guide.id);
      await loadData();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete guide",
      );
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        action={
          <Button
            disabled={games.length === 0}
            onClick={openCreateForm}
            size="lg"
          >
            <Plus aria-hidden="true" data-icon="inline-start" />
            Add guide
          </Button>
        }
        description="Create and organize platinum guides for your games."
        eyebrow="Guide library"
        title="Guides"
      />

      {error && <ErrorNotice message={error} />}

      {!isLoading && games.length === 0 && (
        <ErrorNotice message="Add a game before creating a guide." />
      )}

      {isFormOpen && (
        <CrudForm
          isSaving={isSaving}
          onCancel={() => setIsFormOpen(false)}
          onSubmit={saveGuide}
          title={editingId ? "Edit guide" : "Add guide"}
        >
          <label>
            <span className="text-sm font-medium">Game</span>
            <select
              className={fieldClassName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  game_id: event.target.value,
                }))
              }
              required
              value={form.game_id}
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium">Title</span>
            <input
              autoFocus
              className={fieldClassName}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
              value={form.title}
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium">Description</span>
            <textarea
              className={textAreaClassName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              value={form.description ?? ""}
            />
          </label>
          <label>
            <span className="text-sm font-medium">Source name</span>
            <input
              className={fieldClassName}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  source_name: event.target.value,
                }))
              }
              value={form.source_name ?? ""}
            />
          </label>
          <label>
            <span className="text-sm font-medium">Source URL</span>
            <input
              className={fieldClassName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  source_url: event.target.value,
                }))
              }
              type="url"
              value={form.source_url ?? ""}
            />
          </label>
        </CrudForm>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading guides...</p>
      ) : guides.length === 0 ? (
        <PlaceholderCard
          description="Add a guide after creating at least one game."
          icon={<BookOpen aria-hidden="true" className="size-5" />}
          title="No guides yet"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {guides.map((guide) => (
            <article
              className="rounded-2xl border bg-card p-6 shadow-xs"
              key={guide.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {gameNames.get(guide.game_id) ?? "Unknown game"}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">{guide.title}</h2>
                  {guide.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {guide.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    aria-label={`Edit ${guide.title}`}
                    onClick={() => openEditForm(guide)}
                    size="icon"
                    variant="outline"
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button
                    aria-label={`Delete ${guide.title}`}
                    onClick={() => void deleteGuide(guide)}
                    size="icon"
                    variant="destructive"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
