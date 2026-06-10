import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

function renderApp(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
      }),
    );
  });

  it("renders the dashboard inside the application shell", () => {
    renderApp();

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("navigation", { name: /navigation/i }),
    ).toHaveLength(2);
    expect(screen.getByText("Stored locally")).toBeInTheDocument();
    expect(screen.getAllByText("Example Adventure").length).toBeGreaterThan(0);
  });

  it("navigates between shell pages", () => {
    renderApp();

    fireEvent.click(screen.getAllByRole("link", { name: "Guides" })[0]);

    expect(screen.getByRole("heading", { name: "Guides" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Guides" })[0]).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("redirects unknown routes to the dashboard", () => {
    renderApp("/not-a-route");

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });
});
