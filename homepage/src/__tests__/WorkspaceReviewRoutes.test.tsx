import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import WorkspaceApp from "../apps/WorkspaceApp";

vi.mock("docx-preview", () => ({
  renderAsync: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { email: "member@altair.test" },
    profile: { full_name: "Altair Member" },
    loading: false,
    signOut: vi.fn(),
  }),
}));

describe("workspace review routes", () => {
  it("renders review outside the standard workspace sidebar shell", async () => {
    window.history.pushState({}, "", "/review?app=workspace");
    render(
      <MemoryRouter initialEntries={["/review?app=workspace"]}>
        <WorkspaceApp />
      </MemoryRouter>
    );

    expect(await screen.findByLabelText(/upload a docx file/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to chat/i })).toBeInTheDocument();
    expect(screen.queryByText(/managed llm routing/i)).not.toBeInTheDocument();
  });

  it("opens the shared review surface with the connection drawer from the compatibility route", async () => {
    window.history.pushState({}, "", "/review/settings?app=workspace");
    render(
      <MemoryRouter initialEntries={["/review/settings?app=workspace"]}>
        <WorkspaceApp />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("dialog", { name: /connection settings/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/compatible api key/i)).toBeInTheDocument();
  });
});
