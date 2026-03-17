import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listWorkspaceKeys } from "../lib/workspaceApi";

const fetchMock = vi.fn();

describe("workspaceApi diagnostics", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://josejutfsgvlqrlmrqgl.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_key");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("explains when the workspace edge function is missing", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Requested function was not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      );

    await expect(
      listWorkspaceKeys({
        access_token: "access-token",
      } as never)
    ).rejects.toThrow(/not deployed/i);

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://josejutfsgvlqrlmrqgl.supabase.co/functions/v1/workspace-api",
      { method: "GET" }
    );
  });

  it("keeps the generic message when the diagnostic probe cannot confirm the cause", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Missing Authorization header." }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      );

    await expect(
      listWorkspaceKeys({
        access_token: "access-token",
      } as never)
    ).rejects.toThrow(/Unable to reach the workspace service/i);
  });
});
