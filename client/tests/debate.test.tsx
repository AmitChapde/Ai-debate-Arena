import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DebatePage from "@/app/debate/[id]/page";
import { getDebate, submitDebateResponse, type Debate } from "@/lib/debates";
import { getScenario } from "@/lib/scenarios";
import { scenario, debate } from "./fixtures";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useParams: () => ({ id: "debate-1" }), useRouter: () => ({ push }) }));
vi.mock("@/lib/debates", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/debates")>(),
  getDebate: vi.fn(),
  submitDebateResponse: vi.fn(),
}));
vi.mock("@/lib/scenarios", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/scenarios")>(),
  getScenario: vi.fn(),
}));

const fetchDebate = vi.mocked(getDebate);
const fetchScenario = vi.mocked(getScenario);
const submitResponse = vi.mocked(submitDebateResponse);

describe("debate interaction", () => {
  beforeEach(() => {
    fetchDebate.mockResolvedValue({ debate });
    fetchScenario.mockResolvedValue({ scenario });
  });

  it("renders advocate and challenger messages and submits a user response", async () => {
    submitResponse.mockResolvedValue({ message: { speaker: "user", content: "We can set shared core hours for collaboration.", round: 1, createdAt: "2026-01-01T00:02:00Z" } });
    render(<DebatePage />);
    expect(await screen.findByText("Remote work expands the talent pool.")).toBeInTheDocument();
    expect(screen.getByText("How will you maintain team coordination?")).toBeInTheDocument();
    expect(screen.getByText("The Advocate")).toBeInTheDocument();
    expect(screen.getByText("The Challenger")).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText("Explain your reasoning...");
    fireEvent.change(textarea, { target: { value: "We can set shared core hours for collaboration." } });
    fireEvent.click(screen.getByRole("button", { name: "Submit response" }));
    await waitFor(() => expect(submitResponse).toHaveBeenCalledWith("debate-1", "We can set shared core hours for collaboration."));
    expect(await screen.findByText("We can set shared core hours for collaboration.")).toBeInTheDocument();
  });

  it("shows evaluation scores and feedback for a completed debate", async () => {
    const completed: Debate = {
      ...debate,
      status: "completed",
      currentTurn: "completed",
      evaluation: {
        overallScore: 84, reasoningScore: 86, evidenceScore: 80,
        counterArgumentScore: 82, consistencyScore: 88, adaptabilityScore: 83,
        strengths: ["Clear reasoning"], weaknesses: ["Add more evidence"],
        feedback: "A thoughtful defense with room for stronger sources.",
      },
    };
    fetchDebate.mockResolvedValue({ debate: completed });
    render(<DebatePage />);
    expect(await screen.findByRole("heading", { name: "Your evaluation" })).toBeInTheDocument();
    expect(screen.getByText("84", { exact: true })).toBeInTheDocument();
    expect(screen.getByText(/Clear reasoning/)).toBeInTheDocument();
    expect(screen.getByText("A thoughtful defense with room for stronger sources.")).toBeInTheDocument();
  });
});
