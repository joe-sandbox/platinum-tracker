import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  api,
  type Chapter,
  type CollectibleType,
  type Guide,
  type Section,
} from "@/api";
import { GuideContentPage } from "@/guide-content-page";

vi.mock("@/api", () => ({
  api: {
    getGuide: vi.fn(),
    listChapters: vi.fn(),
    createChapter: vi.fn(),
    updateChapter: vi.fn(),
    deleteChapter: vi.fn(),
    listSections: vi.fn(),
    createSection: vi.fn(),
    updateSection: vi.fn(),
    deleteSection: vi.fn(),
    listCollectibleTypes: vi.fn(),
    createCollectibleType: vi.fn(),
    updateCollectibleType: vi.fn(),
    deleteCollectibleType: vi.fn(),
    listCollectibles: vi.fn(),
    createCollectible: vi.fn(),
    updateCollectible: vi.fn(),
    deleteCollectible: vi.fn(),
  },
}));

const guide: Guide = {
  id: "22222222-2222-4222-8222-222222222222",
  game_id: "11111111-1111-4111-8111-111111111111",
  title: "Example Guide",
  description: null,
  source_url: null,
  source_name: null,
  source_retrieved_at: null,
  created_at: "2026-06-10T00:00:00Z",
  updated_at: "2026-06-10T00:00:00Z",
};

const chapter: Chapter = {
  id: "33333333-3333-4333-8333-333333333333",
  guide_id: guide.id,
  title: "Chapter One",
  description: null,
  position: 1,
};

const section: Section = {
  id: "44444444-4444-4444-8444-444444444444",
  chapter_id: chapter.id,
  title: "Opening",
  description: null,
  position: 1,
};

const collectibleType: CollectibleType = {
  id: "55555555-5555-4555-8555-555555555555",
  guide_id: guide.id,
  name: "Document",
  color: null,
  icon: null,
  position: 1,
};

function renderPage() {
  render(
    <MemoryRouter initialEntries={[`/guides/${guide.id}/content`]}>
      <Routes>
        <Route element={<GuideContentPage />} path="/guides/:guideId/content" />
      </Routes>
    </MemoryRouter>,
  );
}

describe("GuideContentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getGuide).mockResolvedValue(guide);
    vi.mocked(api.listChapters).mockResolvedValue([chapter]);
    vi.mocked(api.listSections).mockResolvedValue([section]);
    vi.mocked(api.listCollectibleTypes).mockResolvedValue([collectibleType]);
    vi.mocked(api.listCollectibles).mockResolvedValue([]);
  });

  it("creates chapters, sections, types, and collectibles", async () => {
    vi.mocked(api.createChapter).mockResolvedValue(chapter);
    vi.mocked(api.createSection).mockResolvedValue(section);
    vi.mocked(api.createCollectibleType).mockResolvedValue(collectibleType);
    vi.mocked(api.createCollectible).mockResolvedValue({
      id: "66666666-6666-4666-8666-666666666666",
      section_id: section.id,
      collectible_type_id: collectibleType.id,
      title: "Captain's Log",
      description: null,
      source_url: null,
      position: 1,
      created_at: "2026-06-10T00:00:00Z",
      updated_at: "2026-06-10T00:00:00Z",
    });

    renderPage();
    expect(await screen.findByText("Chapter One")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add chapter" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Chapter Two" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(api.createChapter).toHaveBeenCalledWith({
        guide_id: guide.id,
        title: "Chapter Two",
        description: null,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Add type" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Weapon" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(api.createCollectibleType).toHaveBeenCalledWith({
        guide_id: guide.id,
        name: "Weapon",
        color: null,
        icon: null,
      }),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Add section to Chapter One" }),
    );
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Courtyard" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(api.createSection).toHaveBeenCalledWith({
        chapter_id: chapter.id,
        title: "Courtyard",
        description: null,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Add collectible" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Captain's Log" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(api.createCollectible).toHaveBeenCalledWith({
        section_id: section.id,
        collectible_type_id: collectibleType.id,
        title: "Captain's Log",
        description: null,
        source_url: null,
      }),
    );
  });
});
