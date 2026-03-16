import { describe, expect, it } from "vitest";
import {
  appendNextSearchParam,
  buildAppPath,
  buildWorkspaceUrl,
  detectActiveApp,
  getAuthCallbackPathFromHash,
  getDefaultSignedInPath,
  getSafeRedirectPath,
  resolveRedirectPath,
} from "../lib/runtime";

describe("runtime host detection", () => {
  it("detects the workspace app from the llm subdomain", () => {
    expect(
      detectActiveApp({
        hostname: "llm.altair.test",
        origin: "https://llm.altair.test",
        search: "",
      })
    ).toBe("workspace");
  });

  it("supports workspace preview mode on localhost", () => {
    expect(
      detectActiveApp({
        hostname: "localhost",
        origin: "http://localhost:5173",
        search: "?app=workspace",
      })
    ).toBe("workspace");
  });

  it("defaults to the marketing app otherwise", () => {
    expect(
      detectActiveApp({
        hostname: "www.altair.test",
        origin: "https://www.altair.test",
        search: "",
      })
    ).toBe("marketing");
  });

  it("builds handoff URLs against the llm subdomain", () => {
    expect(
      buildWorkspaceUrl("/chat", {
        handoffToken: "handoff-123",
        locationLike: {
          hostname: "www.altair.test",
          origin: "https://www.altair.test",
          protocol: "https:",
          search: "",
        },
      })
    ).toBe("https://llm.altair.test/chat?handoff=handoff-123");
  });

  it("uses host-aware default signed-in destinations", () => {
    expect(
      getDefaultSignedInPath("marketing", {
        hostname: "www.altair.test",
        origin: "https://www.altair.test",
        search: "",
      })
    ).toBe("/account");
    expect(
      getDefaultSignedInPath("workspace", {
        hostname: "localhost",
        origin: "http://localhost:5173",
        search: "?app=workspace",
      })
    ).toBe("/chat?app=workspace");
  });

  it("keeps marketing localhost paths clean and scopes workspace localhost paths", () => {
    expect(
      buildAppPath("/account", {
        app: "marketing",
        locationLike: {
          hostname: "localhost",
          origin: "http://localhost:5173",
          search: "",
        },
      })
    ).toBe("/account");

    expect(
      buildAppPath("/chat", {
        app: "workspace",
        locationLike: {
          hostname: "localhost",
          origin: "http://localhost:5173",
          search: "",
        },
      })
    ).toBe("/chat?app=workspace");
  });

  it("normalizes hash-only OAuth callbacks onto the auth callback route", () => {
    expect(
      getAuthCallbackPathFromHash({
        hostname: "localhost",
        origin: "http://localhost:3000",
        pathname: "/",
        search: "",
        hash: "#access_token=test-access&refresh_token=test-refresh",
      })
    ).toBe("/auth/callback#access_token=test-access&refresh_token=test-refresh");
  });


  it("normalizes query-based OAuth callbacks onto the auth callback route", () => {
    expect(
      getAuthCallbackPathFromHash({
        hostname: "localhost",
        origin: "http://localhost:3000",
        pathname: "/",
        search: "?error=invalid_request&error_code=bad_oauth_state&error_description=OAuth+state+not+found+or+expired",
        hash: "",
      })
    ).toBe(
      "/auth/callback?error=invalid_request&error_code=bad_oauth_state&error_description=OAuth+state+not+found+or+expired"
    );
  });

  it("returns null when already on the callback route", () => {
    expect(
      getAuthCallbackPathFromHash({
        hostname: "localhost",
        origin: "http://localhost:3000",
        pathname: "/auth/callback",
        search: "",
        hash: "#access_token=test-access&refresh_token=test-refresh",
      })
    ).toBeNull();
  });

  it("preserves only same-origin redirect paths", () => {
    const locationLike = {
      hostname: "localhost",
      origin: "http://localhost:5173",
      search: "",
    };

    expect(getSafeRedirectPath("/chat?app=workspace", locationLike)).toBe("/chat?app=workspace");
    expect(getSafeRedirectPath("https://evil.example/phish", locationLike)).toBeNull();
    expect(getSafeRedirectPath("//evil.example/phish", locationLike)).toBeNull();
  });

  it("adds next params only for safe internal paths", () => {
    const locationLike = {
      hostname: "localhost",
      origin: "http://localhost:5173",
      search: "",
    };

    expect(appendNextSearchParam("/login", "/chat?app=workspace", locationLike)).toBe(
      "/login?next=%2Fchat%3Fapp%3Dworkspace"
    );
    expect(appendNextSearchParam("/login", "https://evil.example/phish", locationLike)).toBe("/login");
  });

  it("falls back to the signed-in default when next is unsafe", () => {
    const locationLike = {
      hostname: "localhost",
      origin: "http://localhost:5173",
      search: "",
    };

    expect(resolveRedirectPath("/contact", "/account", locationLike)).toBe("/contact");
    expect(resolveRedirectPath("https://evil.example/phish", "/account", locationLike)).toBe("/account");
  });
});
