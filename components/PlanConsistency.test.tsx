import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CarePlanViews } from "@/components/CarePlanViews";
import { PreviewScreen } from "@/components/OnboardingScreens";
import { currentDemoDate } from "@/lib/demo-date";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams("view=today"),
}));

afterEach(cleanup);

const tasks = [
  {
    id: "morning-task",
    title: "Morning medicine",
    source: "Fixture",
    ownerService: "GP",
    mayMove: true,
  },
  {
    id: "midday-task",
    title: "Midday check",
    source: "Fixture",
    ownerService: "Cardiology",
    mayMove: true,
  },
  {
    id: "evening-task",
    title: "Evening medicine",
    source: "Fixture",
    ownerService: "GP",
    mayMove: true,
  },
];

describe("medical plan consistency", () => {
  it("shows the complete grouped day without duplicating personal anchors", () => {
    const date = currentDemoDate();
    render(<CarePlanViews
      tasks={tasks}
      items={tasks.map((task, index) => ({
        id: `item-${index}`,
        occurrenceDate: date,
        startTime: ["07:30", "14:00", "18:00"][index],
        momentId: `moment-${index}`,
        momentTitle: ["Morning routine", "Midday care moment", "Evening routine"][index],
        durationMinutes: 5,
        status: "SCHEDULED",
        explanation: "Scheduled deterministically.",
        task: { id: task.id, title: task.title },
      }))}
    />);

    expect(screen.getByRole("heading", { name: "Medical plan" })).toBeVisible();
    expect(screen.getByText("Morning medicine")).toBeVisible();
    expect(screen.getByText("Midday check")).toBeVisible();
    expect(screen.getByText("Evening medicine")).toBeVisible();
    expect(screen.queryByText("Protected anchors")).not.toBeInTheDocument();
  });
});

describe("deterministic Life Map preview", () => {
  it("labels moved and unplaceable work and removes redundant status cards", () => {
    const date = currentDemoDate();
    render(<PreviewScreen
      update
      unresolvedCount={0}
      baselineItems={[
        { taskId: "medicine", occurrenceDate: date, startTime: "07:00", status: "SCHEDULED" },
      ]}
      plan={{
        id: "proposed",
        rangeStart: date,
        rangeEnd: date,
        metricsJson: JSON.stringify({
          totalActions: 2,
          totalCareMinutes: 10,
          totalCareMoments: 1,
        }),
        items: [
          {
            id: "moved",
            occurrenceDate: date,
            startTime: "07:30",
            momentTitle: "Morning routine",
            status: "SCHEDULED",
            explanation: "Scheduled at the next available time.",
            task: { id: "medicine", title: "Morning medicine" },
          },
          {
            id: "unplaced",
            occurrenceDate: date,
            startTime: null,
            momentTitle: null,
            status: "NEEDS_CLARIFICATION",
            explanation: "All permitted slots overlap.",
            task: { id: "second-medicine", title: "Second medicine" },
          },
        ],
      }}
    />);

    expect(screen.getByText("Moved from 07:00 to 07:30")).toBeVisible();
    expect(screen.getByText("No permitted time remains")).toBeVisible();
    expect(screen.getByText(/will not move it outside its verified window/)).toBeVisible();
    expect(screen.queryByText("Your active plan has not changed")).not.toBeInTheDocument();
    expect(screen.queryByText("Your protected time stays in place")).not.toBeInTheDocument();
    expect(screen.queryByText("How this timetable was built")).not.toBeInTheDocument();
  });
});
