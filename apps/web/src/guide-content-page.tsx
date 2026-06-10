import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  Boxes,
  FileQuestion,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  api,
  type Chapter,
  type Collectible,
  type CollectibleType,
  type Guide,
  type Section,
} from "@/api";
import {
  CrudForm,
  fieldClassName,
  textAreaClassName,
} from "@/components/crud-form";
import { Button } from "@/components/ui/button";
import { PageHeader, PlaceholderCard } from "@/pages";

type Editor =
  | {
      kind: "chapter";
      id?: string;
      parentId: string;
      title: string;
      description: string;
    }
  | {
      kind: "section";
      id?: string;
      parentId: string;
      title: string;
      description: string;
    }
  | {
      kind: "type";
      id?: string;
      parentId: string;
      title: string;
      color: string;
      icon: string;
    }
  | {
      kind: "collectible";
      id?: string;
      parentId: string;
      title: string;
      description: string;
      collectibleTypeId: string;
      sourceUrl: string;
    };

function optional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

function editorTitle(editor: Editor): string {
  const action = editor.id ? "Edit" : "Add";
  const labels = {
    chapter: "chapter",
    section: "section",
    type: "collectible type",
    collectible: "collectible",
  };
  return `${action} ${labels[editor.kind]}`;
}

export function GuideContentPage() {
  const { guideId = "" } = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [collectibleTypes, setCollectibleTypes] = useState<CollectibleType[]>(
    [],
  );
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeNames = useMemo(
    () => new Map(collectibleTypes.map((type) => [type.id, type.name])),
    [collectibleTypes],
  );

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [guideData, chapterData, typeData] = await Promise.all([
        api.getGuide(guideId),
        api.listChapters(guideId),
        api.listCollectibleTypes(guideId),
      ]);
      const sectionGroups = await Promise.all(
        chapterData.map((chapter) => api.listSections(chapter.id)),
      );
      const sectionData = sectionGroups.flat();
      const collectibleGroups = await Promise.all(
        sectionData.map((section) => api.listCollectibles(section.id)),
      );
      setGuide(guideData);
      setChapters(chapterData);
      setSections(sectionData);
      setCollectibleTypes(typeData);
      setCollectibles(collectibleGroups.flat());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load guide content",
      );
    } finally {
      setIsLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  async function saveEditor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    setIsSaving(true);
    setError(null);
    try {
      if (editor.kind === "chapter") {
        const payload = {
          guide_id: editor.parentId,
          title: editor.title.trim(),
          description: optional(editor.description),
        };
        await (editor.id
          ? api.updateChapter(editor.id, payload)
          : api.createChapter(payload));
      } else if (editor.kind === "section") {
        const payload = {
          chapter_id: editor.parentId,
          title: editor.title.trim(),
          description: optional(editor.description),
        };
        await (editor.id
          ? api.updateSection(editor.id, payload)
          : api.createSection(payload));
      } else if (editor.kind === "type") {
        const payload = {
          guide_id: editor.parentId,
          name: editor.title.trim(),
          color: optional(editor.color),
          icon: optional(editor.icon),
        };
        await (editor.id
          ? api.updateCollectibleType(editor.id, payload)
          : api.createCollectibleType(payload));
      } else {
        const payload = {
          section_id: editor.parentId,
          collectible_type_id: editor.collectibleTypeId,
          title: editor.title.trim(),
          description: optional(editor.description),
          source_url: optional(editor.sourceUrl),
        };
        await (editor.id
          ? api.updateCollectible(editor.id, payload)
          : api.createCollectible(payload));
      }
      setEditor(null);
      await loadContent();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save guide content",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteItem(
    label: string,
    action: () => Promise<void>,
    includesChildren = false,
  ) {
    const suffix = includesChildren ? " and all content inside it" : "";
    if (!window.confirm(`Delete "${label}"${suffix}?`)) return;
    setError(null);
    try {
      await action();
      await loadContent();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete guide content",
      );
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading content...</p>;
  }

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost">
        <Link to="/guides">
          <ArrowLeft aria-hidden="true" data-icon="inline-start" />
          Back to guides
        </Link>
      </Button>

      <PageHeader
        action={
          <Button
            onClick={() =>
              setEditor({
                kind: "chapter",
                parentId: guideId,
                title: "",
                description: "",
              })
            }
          >
            <Plus aria-hidden="true" data-icon="inline-start" />
            Add chapter
          </Button>
        }
        description="Manage chapters, sections, collectible types, and collectibles."
        eyebrow="Guide content"
        title={guide?.title ?? "Guide not found"}
      />

      {error && (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {editor && (
        <CrudForm
          isSaving={isSaving}
          onCancel={() => setEditor(null)}
          onSubmit={saveEditor}
          title={editorTitle(editor)}
        >
          <label className="sm:col-span-2">
            <span className="text-sm font-medium">
              {editor.kind === "type" ? "Name" : "Title"}
            </span>
            <input
              autoFocus
              className={fieldClassName}
              maxLength={255}
              onChange={(event) =>
                setEditor({ ...editor, title: event.target.value })
              }
              required
              value={editor.title}
            />
          </label>
          {(editor.kind === "chapter" ||
            editor.kind === "section" ||
            editor.kind === "collectible") && (
            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Description</span>
              <textarea
                className={textAreaClassName}
                onChange={(event) =>
                  setEditor({ ...editor, description: event.target.value })
                }
                value={editor.description}
              />
            </label>
          )}
          {editor.kind === "type" && (
            <>
              <label>
                <span className="text-sm font-medium">Color token</span>
                <input
                  className={fieldClassName}
                  maxLength={50}
                  onChange={(event) =>
                    setEditor({ ...editor, color: event.target.value })
                  }
                  value={editor.color}
                />
              </label>
              <label>
                <span className="text-sm font-medium">Icon key</span>
                <input
                  className={fieldClassName}
                  maxLength={100}
                  onChange={(event) =>
                    setEditor({ ...editor, icon: event.target.value })
                  }
                  value={editor.icon}
                />
              </label>
            </>
          )}
          {editor.kind === "collectible" && (
            <>
              <label>
                <span className="text-sm font-medium">Collectible type</span>
                <select
                  className={fieldClassName}
                  onChange={(event) =>
                    setEditor({
                      ...editor,
                      collectibleTypeId: event.target.value,
                    })
                  }
                  required
                  value={editor.collectibleTypeId}
                >
                  {collectibleTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-sm font-medium">Source URL</span>
                <input
                  className={fieldClassName}
                  onChange={(event) =>
                    setEditor({ ...editor, sourceUrl: event.target.value })
                  }
                  type="url"
                  value={editor.sourceUrl}
                />
              </label>
            </>
          )}
        </CrudForm>
      )}

      <section className="rounded-2xl border bg-card p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Collectible types</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Types are shared by every collectible in this guide.
            </p>
          </div>
          <Button
            onClick={() =>
              setEditor({
                kind: "type",
                parentId: guideId,
                title: "",
                color: "",
                icon: "",
              })
            }
            variant="outline"
          >
            <Plus aria-hidden="true" data-icon="inline-start" />
            Add type
          </Button>
        </div>
        {collectibleTypes.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">
            Add a collectible type before adding collectibles.
          </p>
        ) : (
          <div className="mt-5 flex flex-wrap gap-2">
            {collectibleTypes.map((type) => (
              <div
                className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm"
                key={type.id}
              >
                <span>{type.name}</span>
                <button
                  aria-label={`Edit type ${type.name}`}
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setEditor({
                      kind: "type",
                      id: type.id,
                      parentId: type.guide_id,
                      title: type.name,
                      color: type.color ?? "",
                      icon: type.icon ?? "",
                    })
                  }
                  type="button"
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                </button>
                <button
                  aria-label={`Delete type ${type.name}`}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    void deleteItem(type.name, () =>
                      api.deleteCollectibleType(type.id),
                    )
                  }
                  type="button"
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {chapters.length === 0 ? (
        <PlaceholderCard
          description="Add the first chapter to start building the guide hierarchy."
          icon={<Boxes aria-hidden="true" className="size-5" />}
          title="No chapters yet"
        />
      ) : (
        <div className="space-y-6">
          {chapters.map((chapter) => {
            const chapterSections = sections.filter(
              (section) => section.chapter_id === chapter.id,
            );
            return (
              <section
                className="overflow-hidden rounded-2xl border bg-card shadow-xs"
                key={chapter.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b p-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Chapter {chapter.position}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">
                      {chapter.title}
                    </h2>
                    {chapter.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      aria-label={`Add section to ${chapter.title}`}
                      onClick={() =>
                        setEditor({
                          kind: "section",
                          parentId: chapter.id,
                          title: "",
                          description: "",
                        })
                      }
                      size="sm"
                      variant="outline"
                    >
                      <Plus aria-hidden="true" />
                      Add section
                    </Button>
                    <Button
                      aria-label={`Edit chapter ${chapter.title}`}
                      onClick={() =>
                        setEditor({
                          kind: "chapter",
                          id: chapter.id,
                          parentId: chapter.guide_id,
                          title: chapter.title,
                          description: chapter.description ?? "",
                        })
                      }
                      size="icon"
                      variant="outline"
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button
                      aria-label={`Delete chapter ${chapter.title}`}
                      onClick={() =>
                        void deleteItem(
                          chapter.title,
                          () => api.deleteChapter(chapter.id),
                          true,
                        )
                      }
                      size="icon"
                      variant="destructive"
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  {chapterSections.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No sections in this chapter.
                    </p>
                  ) : (
                    chapterSections.map((section) => {
                      const sectionCollectibles = collectibles.filter(
                        (collectible) => collectible.section_id === section.id,
                      );
                      return (
                        <article
                          className="rounded-xl border bg-background p-5"
                          key={section.id}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">
                                Section {section.position}
                              </p>
                              <h3 className="mt-1 font-semibold">
                                {section.title}
                              </h3>
                              {section.description && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {section.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                disabled={collectibleTypes.length === 0}
                                onClick={() =>
                                  setEditor({
                                    kind: "collectible",
                                    parentId: section.id,
                                    title: "",
                                    description: "",
                                    collectibleTypeId:
                                      collectibleTypes[0]?.id ?? "",
                                    sourceUrl: "",
                                  })
                                }
                                size="sm"
                                variant="outline"
                              >
                                <Plus aria-hidden="true" />
                                Add collectible
                              </Button>
                              <Button
                                aria-label={`Edit section ${section.title}`}
                                onClick={() =>
                                  setEditor({
                                    kind: "section",
                                    id: section.id,
                                    parentId: section.chapter_id,
                                    title: section.title,
                                    description: section.description ?? "",
                                  })
                                }
                                size="icon"
                                variant="outline"
                              >
                                <Pencil aria-hidden="true" />
                              </Button>
                              <Button
                                aria-label={`Delete section ${section.title}`}
                                onClick={() =>
                                  void deleteItem(
                                    section.title,
                                    () => api.deleteSection(section.id),
                                    true,
                                  )
                                }
                                size="icon"
                                variant="destructive"
                              >
                                <Trash2 aria-hidden="true" />
                              </Button>
                            </div>
                          </div>

                          {sectionCollectibles.length === 0 ? (
                            <p className="mt-4 text-sm text-muted-foreground">
                              No collectibles in this section.
                            </p>
                          ) : (
                            <ul className="mt-4 divide-y rounded-lg border">
                              {sectionCollectibles.map((collectible) => (
                                <li
                                  className="flex items-start justify-between gap-4 p-4"
                                  key={collectible.id}
                                >
                                  <div>
                                    <p className="font-medium">
                                      {collectible.title}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {typeNames.get(
                                        collectible.collectible_type_id,
                                      ) ?? "Unknown type"}
                                    </p>
                                    {collectible.description && (
                                      <p className="mt-2 text-sm text-muted-foreground">
                                        {collectible.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      aria-label={`Edit collectible ${collectible.title}`}
                                      onClick={() =>
                                        setEditor({
                                          kind: "collectible",
                                          id: collectible.id,
                                          parentId: collectible.section_id,
                                          title: collectible.title,
                                          description:
                                            collectible.description ?? "",
                                          collectibleTypeId:
                                            collectible.collectible_type_id,
                                          sourceUrl:
                                            collectible.source_url ?? "",
                                        })
                                      }
                                      size="icon"
                                      variant="outline"
                                    >
                                      <Pencil aria-hidden="true" />
                                    </Button>
                                    <Button
                                      aria-label={`Delete collectible ${collectible.title}`}
                                      onClick={() =>
                                        void deleteItem(collectible.title, () =>
                                          api.deleteCollectible(collectible.id),
                                        )
                                      }
                                      size="icon"
                                      variant="destructive"
                                    >
                                      <Trash2 aria-hidden="true" />
                                    </Button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!guide && !error && (
        <PlaceholderCard
          description="Return to the guide library and select an existing guide."
          icon={<FileQuestion aria-hidden="true" className="size-5" />}
          title="Guide not found"
        />
      )}
    </div>
  );
}
