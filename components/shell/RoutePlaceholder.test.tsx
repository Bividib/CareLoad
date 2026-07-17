import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RoutePlaceholder } from "@/components/shell/RoutePlaceholder";

describe("RoutePlaceholder", () => {
  it("renders the route title and prototype boundary", () => {
    render(
      <RoutePlaceholder
        title="Welcome to CareLoad"
        description="Feature work has not started."
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Welcome to CareLoad" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/not a medical device/i)).toBeInTheDocument();
  });
});

