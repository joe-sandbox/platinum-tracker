const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export type Game = {
  id: string;
  title: string;
  platform: string | null;
  edition: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type GameInput = {
  title: string;
  platform: string | null;
  edition: string | null;
  cover_image_url: string | null;
};

export type Guide = {
  id: string;
  game_id: string;
  title: string;
  description: string | null;
  source_url: string | null;
  source_name: string | null;
  source_retrieved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GuideInput = {
  game_id: string;
  title: string;
  description: string | null;
  source_url: string | null;
  source_name: string | null;
};

export type Chapter = {
  id: string;
  guide_id: string;
  title: string;
  description: string | null;
  position: number;
};

export type ChapterInput = Omit<Chapter, "id" | "position">;

export type Section = {
  id: string;
  chapter_id: string;
  title: string;
  description: string | null;
  position: number;
};

export type SectionInput = Omit<Section, "id" | "position">;

export type CollectibleType = {
  id: string;
  guide_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  position: number;
};

export type CollectibleTypeInput = Omit<CollectibleType, "id" | "position">;

export type Collectible = {
  id: string;
  section_id: string;
  collectible_type_id: string;
  title: string;
  description: string | null;
  source_url: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type CollectibleInput = Omit<
  Collectible,
  "id" | "position" | "created_at" | "updated_at"
>;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) {
        message = payload.detail;
      }
    } catch {
      // Keep the status-based fallback for non-JSON errors.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  listGames: () => request<Game[]>("/api/games"),
  createGame: (payload: GameInput) =>
    request<Game>("/api/games", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateGame: (gameId: string, payload: GameInput) =>
    request<Game>(`/api/games/${gameId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteGame: (gameId: string) =>
    request<void>(`/api/games/${gameId}`, { method: "DELETE" }),
  listGuides: () => request<Guide[]>("/api/guides"),
  getGuide: (guideId: string) => request<Guide>(`/api/guides/${guideId}`),
  createGuide: (payload: GuideInput) =>
    request<Guide>("/api/guides", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateGuide: (guideId: string, payload: GuideInput) =>
    request<Guide>(`/api/guides/${guideId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteGuide: (guideId: string) =>
    request<void>(`/api/guides/${guideId}`, { method: "DELETE" }),
  listChapters: (guideId: string) =>
    request<Chapter[]>(`/api/chapters?guide_id=${encodeURIComponent(guideId)}`),
  createChapter: (payload: ChapterInput) =>
    request<Chapter>("/api/chapters", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateChapter: (chapterId: string, payload: ChapterInput) =>
    request<Chapter>(`/api/chapters/${chapterId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteChapter: (chapterId: string) =>
    request<void>(`/api/chapters/${chapterId}`, { method: "DELETE" }),
  listSections: (chapterId: string) =>
    request<Section[]>(
      `/api/sections?chapter_id=${encodeURIComponent(chapterId)}`,
    ),
  createSection: (payload: SectionInput) =>
    request<Section>("/api/sections", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateSection: (sectionId: string, payload: SectionInput) =>
    request<Section>(`/api/sections/${sectionId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteSection: (sectionId: string) =>
    request<void>(`/api/sections/${sectionId}`, { method: "DELETE" }),
  listCollectibleTypes: (guideId: string) =>
    request<CollectibleType[]>(
      `/api/collectible-types?guide_id=${encodeURIComponent(guideId)}`,
    ),
  createCollectibleType: (payload: CollectibleTypeInput) =>
    request<CollectibleType>("/api/collectible-types", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCollectibleType: (
    collectibleTypeId: string,
    payload: CollectibleTypeInput,
  ) =>
    request<CollectibleType>(`/api/collectible-types/${collectibleTypeId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteCollectibleType: (collectibleTypeId: string) =>
    request<void>(`/api/collectible-types/${collectibleTypeId}`, {
      method: "DELETE",
    }),
  listCollectibles: (sectionId: string) =>
    request<Collectible[]>(
      `/api/collectibles?section_id=${encodeURIComponent(sectionId)}`,
    ),
  createCollectible: (payload: CollectibleInput) =>
    request<Collectible>("/api/collectibles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCollectible: (collectibleId: string, payload: CollectibleInput) =>
    request<Collectible>(`/api/collectibles/${collectibleId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteCollectible: (collectibleId: string) =>
    request<void>(`/api/collectibles/${collectibleId}`, { method: "DELETE" }),
};
