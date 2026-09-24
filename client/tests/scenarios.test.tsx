import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ScenariosPage from "@/app/scenarios/page";
import ScenarioPage from "@/app/scenarios/[id]/page";
import { getScenario, getScenarios } from "@/lib/scenarios";
import { scenario } from "./fixtures";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useParams: () => ({ id: "scenario-1" }), useRouter: () => ({ push }) }));
vi.mock("@/lib/scenarios", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/scenarios")>(),
  getScenarios: vi.fn(),
  getScenario: vi.fn(),
}));

const listScenarios = vi.mocked(getScenarios);
const fetchScenario = vi.mocked(getScenario);

describe("scenario browsing", () => {
  beforeEach(() => {
    listScenarios.mockResolvedValue({ scenarios: [scenario] });
    fetchScenario.mockResolvedValue({ scenario });
  });

  it("renders scenarios returned by the API", async () => {
    render(<ScenariosPage />);
    expect(await screen.findByRole("heading", { name: scenario.title })).toBeInTheDocument();
    expect(screen.getByText("business")).toBeInTheDocument();
  });

  it("requests scenarios again with the selected category and difficulty", async () => {
    render(<ScenariosPage />);
    await screen.findByRole("heading", { name: scenario.title });
    const [categoryFilter, difficultyFilter] = screen.getAllByRole("combobox");
    fireEvent.change(categoryFilter, { target: { value: "business" } });
    fireEvent.change(difficultyFilter, { target: { value: "hard" } });
    await waitFor(() => expect(listScenarios).toHaveBeenLastCalledWith({ category: "business", difficulty: "hard", status: "published" }));
  });
});

describe("scenario details", () => {
  beforeEach(() => fetchScenario.mockResolvedValue({ scenario }));

  it("shows the scenario details and available positions", async () => {
    render(<ScenarioPage />);
    expect(await screen.findByRole("heading", { name: scenario.title })).toBeInTheDocument();
    expect(screen.getByText(scenario.context)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Support remote work/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Oppose remote work/ })).toBeInTheDocument();
  });

  it("enables Continue after a position is selected and navigates with it", async () => {
    render(<ScenarioPage />);
    const continueButton = await screen.findByRole("button", { name: /Continue to Debate/ });
    expect(continueButton).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Support remote work/ }));
    expect(continueButton).toBeEnabled();
    fireEvent.click(continueButton);
    expect(push).toHaveBeenCalledWith("/debate/new?scenarioId=scenario-1&position=support");
  });
});
