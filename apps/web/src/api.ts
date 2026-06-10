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
};
