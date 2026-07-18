import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BottomNavigation, CareMomentCard, MobileShell } from "@/components/ui/CareLoadUI";

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

  it("hides notifications during onboarding and keeps them in the patient area", () => {
    const onboarding = render(<MobileShell onboarding>Registration step</MobileShell>);
    expect(screen.queryByRole("link", { name: /Notifications:/ })).not.toBeInTheDocument();
    onboarding.unmount();

    render(<MobileShell active="/patient/today">Patient area</MobileShell>);
    expect(screen.getByRole("link", { name: "Notifications: 2 unread messages in Match" })).toBeVisible();
  });
});
