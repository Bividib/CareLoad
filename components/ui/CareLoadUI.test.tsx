import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BottomNavigation, CareMomentCard } from "@/components/ui/CareLoadUI";

describe("patient UI primitives", () => {
  it("keeps the required navigation order and marks the active tab", () => {
    render(<BottomNavigation active="/patient/care-plan" />);
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Today", "Care Plan", "Add to My Life", "Messages", "Match",
    ]);
    expect(screen.getByRole("link", { name: "Care Plan" })).toHaveAttribute("aria-current", "page");
  });

  it("renders care moment content and duration accessibly", () => {
    render(<CareMomentCard title="Morning routine" tasks={["Weight check"]} minutes={5} />);
    expect(screen.getByRole("heading", { name: "Morning routine" })).toBeInTheDocument();
    expect(screen.getByText("5 min")).toBeInTheDocument();
  });
});
