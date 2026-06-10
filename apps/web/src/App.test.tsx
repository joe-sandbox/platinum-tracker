import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("introduces the platinum tracker", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Platinum Tracker" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/create game guides and track every collectible/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create your first guide" }),
    ).toBeInTheDocument();
  });
});
