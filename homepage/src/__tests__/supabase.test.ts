import { describe, expect, it } from "vitest";
import { resolveAuthCallbackUrl } from "../lib/supabase";

describe("resolveAuthCallbackUrl", () => {
  it("keeps a configured localhost callback during local development", () => {
    const callbackUrl = resolveAuthCallbackUrl("http://localhost:3000/auth/callback", {
      origin: "http://localhost:5173",
      hostname: "localhost",
    });

    expect(callbackUrl.toString()).toBe("http://localhost:3000/auth/callback");
  });

  it("rewrites a localhost callback to the current production origin", () => {
    const callbackUrl = resolveAuthCallbackUrl("http://localhost:3000/auth/callback", {
      origin: "https://altairworld.com",
      hostname: "altairworld.com",
    });

    expect(callbackUrl.toString()).toBe("https://altairworld.com/auth/callback");
  });

  it("uses the current origin callback when no explicit env override is set", () => {
    const callbackUrl = resolveAuthCallbackUrl(undefined, {
      origin: "https://altairworld.com",
      hostname: "altairworld.com",
    });

    expect(callbackUrl.toString()).toBe("https://altairworld.com/auth/callback");
  });

  it("falls back to the app callback when configured url points to an invalid Supabase path", () => {
    const callbackUrl = resolveAuthCallbackUrl("https://project-ref.supabase.co/altairworld.com", {
      origin: "https://altairworld.com",
      hostname: "altairworld.com",
    });

    expect(callbackUrl.toString()).toBe("https://altairworld.com/auth/callback");
  });
});
