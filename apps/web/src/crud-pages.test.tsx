import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { api, type Game, type Guide } from "@/api";
import { GamesPage, GuidesPage } from "@/crud-pages";

vi.mock("@/api", () => ({
  api: {
    listGames: vi.fn(),
    createGame: vi.fn(),
    updateGame: vi.fn(),
    deleteGame: vi.fn(),
    listGuides: vi.fn(),
    createGuide: vi.fn(),
    updateGuide: vi.fn(),
    deleteGuide: vi.fn(),
  },
}));

const game: Game = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Example Adventure",
  platform: "PlayStation 5",
  edition: "Standard",
  cover_image_url: null,
  created_at: "2026-06-10T00:00:00Z",
  updated_at: "2026-06-10T00:00:00Z",
};

const guide: Guide = {
  id: "22222222-2222-4222-8222-222222222222",
  game_id: game.id,
  title: "Example Guide",
  description: "Find everything.",
  source_url: null,
  source_name: null,
  source_retrieved_at: null,
  created_at: "2026-06-10T00:00:00Z",
  updated_at: "2026-06-10T00:00:00Z",
};

describe("GamesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listGames).mockResolvedValue([game]);
  });

  it("creates a game and refreshes the list", async () => {
    const newGame = { ...game, id: "new-game", title: "New Game" };
    vi.mocked(api.createGame).mockResolvedValue(newGame);
    vi.mocked(api.listGames)
      .mockResolvedValueOnce([game])
      .mockResolvedValueOnce([game, newGame]);

    render(
      <MemoryRouter>
        <GamesPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Example Adventure")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add game" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Game" },
    });
    fireEvent.change(screen.getByLabelText("Platform"), {
      target: { value: "PlayStation 5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(api.createGame).toHaveBeenCalledWith({
        title: "New Game",
        platform: "PlayStation 5",
        edition: null,
        cover_image_url: null,
      }),
    );
    expect(await screen.findByText("New Game")).toBeInTheDocument();
  });

  it("edits and deletes an existing game", async () => {
    vi.mocked(api.updateGame).mockResolvedValue({
      ...game,
      title: "Updated Adventure",
    });
    vi.mocked(api.deleteGame).mockResolvedValue();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter>
        <GamesPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Example Adventure")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Edit Example Adventure" }),
    );
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated Adventure" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(api.updateGame).toHaveBeenCalled());

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Example Adventure" }),
    );
    await waitFor(() => expect(api.deleteGame).toHaveBeenCalledWith(game.id));
  });
});

describe("GuidesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listGames).mockResolvedValue([game]);
    vi.mocked(api.listGuides).mockResolvedValue([guide]);
  });

  it("creates a guide for a selected game", async () => {
    const newGuide = { ...guide, id: "new-guide", title: "New Guide" };
    vi.mocked(api.createGuide).mockResolvedValue(newGuide);
    vi.mocked(api.listGuides)
      .mockResolvedValueOnce([guide])
      .mockResolvedValueOnce([guide, newGuide]);

    render(
      <MemoryRouter>
        <GuidesPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Example Guide")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add guide" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Guide" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(api.createGuide).toHaveBeenCalledWith({
        game_id: game.id,
        title: "New Guide",
        description: null,
        source_url: null,
        source_name: null,
      }),
    );
    expect(await screen.findByText("New Guide")).toBeInTheDocument();
  });
});
