export type ActiveApp = "marketing" | "workspace";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const WORKSPACE_QUERY_VALUE = "workspace";

type LocationLike = {
  hostname: string;
  origin: string;
  port?: string;
  protocol?: string;
  search?: string;
  pathname?: string;
  hash?: string;
};

type BuildAppPathOptions = {
  app?: ActiveApp;
  locationLike?: LocationLike;
};

function getLocationOrigin(locationLike: LocationLike) {
  return (
    locationLike.origin ||
    `${locationLike.protocol ?? "https:"}//${locationLike.hostname}${locationLike.port ? `:${locationLike.port}` : ""}`
  );
}

export function detectActiveApp(locationLike: LocationLike): ActiveApp {
  const { hostname, search = "" } = locationLike;

  if (hostname === "llm" || hostname.startsWith("llm.")) {
    return "workspace";
  }

  if (LOCAL_HOSTS.has(hostname)) {
    const searchParams = new URLSearchParams(search);

    if (searchParams.get("app") === WORKSPACE_QUERY_VALUE) {
      return "workspace";
    }
  }

  return "marketing";
}

export function getActiveApp() {
  return detectActiveApp(window.location);
}

export function isLocalWorkspacePreview(locationLike: LocationLike = window.location) {
  return detectActiveApp(locationLike) === "workspace" && LOCAL_HOSTS.has(locationLike.hostname);
}

export function buildAppPath(path: string, options: BuildAppPathOptions = {}) {
  const { locationLike = window.location, app = detectActiveApp(locationLike) } = options;
  const origin = getLocationOrigin(locationLike);
  const url = new URL(path, origin);

  if (app === "workspace" && LOCAL_HOSTS.has(locationLike.hostname)) {
    url.searchParams.set("app", WORKSPACE_QUERY_VALUE);
  } else {
    url.searchParams.delete("app");
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function getSafeRedirectPath(
  path: string | null | undefined,
  locationLike: LocationLike = window.location
) {
  if (!path) {
    return null;
  }

  try {
    const origin = getLocationOrigin(locationLike);
    const url = new URL(path, origin);

    if (url.origin !== origin || !url.pathname.startsWith("/")) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function appendNextSearchParam(
  path: string,
  nextPath: string | null | undefined,
  locationLike: LocationLike = window.location
) {
  const safeNextPath = getSafeRedirectPath(nextPath, locationLike);

  if (!safeNextPath) {
    return path;
  }

  const url = new URL(path, getLocationOrigin(locationLike));
  url.searchParams.set("next", safeNextPath);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function resolveRedirectPath(
  nextPath: string | null | undefined,
  fallbackPath = getDefaultSignedInPath(),
  locationLike: LocationLike = window.location
) {
  return getSafeRedirectPath(nextPath, locationLike) ?? fallbackPath;
}

export function getDefaultSignedInPath(app = getActiveApp(), locationLike: LocationLike = window.location) {
  return buildAppPath(app === "workspace" ? "/chat" : "/account", { app, locationLike });
}

export function getWorkspaceOrigin(locationLike: LocationLike = window.location) {
  const configuredOrigin = import.meta.env.VITE_WORKSPACE_ORIGIN;

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  const { hostname, origin, port = "", protocol = "https:" } = locationLike;

  if (hostname === "llm" || hostname.startsWith("llm.")) {
    return origin.replace(/\/$/, "");
  }

  if (LOCAL_HOSTS.has(hostname)) {
    const localOrigin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
    return localOrigin.replace(/\/$/, "");
  }

  const [subdomain, ...rest] = hostname.split(".");
  const workspaceHost = subdomain === "www" ? `llm.${rest.join(".")}` : `llm.${hostname}`;
  return `${protocol}//${workspaceHost}${port ? `:${port}` : ""}`.replace(/\/$/, "");
}

export function getAuthCallbackPathFromHash(locationLike: LocationLike = window.location) {
  const hash = locationLike.hash ?? "";
  const search = locationLike.search ?? "";
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(search);
  const hasCallbackPayload =
    hashParams.has("access_token") ||
    hashParams.has("refresh_token") ||
    hashParams.has("error") ||
    hashParams.has("error_description") ||
    searchParams.has("code") ||
    searchParams.has("error_code") ||
    searchParams.has("error_description");

  if (!hasCallbackPayload || locationLike.pathname === "/auth/callback") {
    return null;
  }

  const callbackPath = buildAppPath("/auth/callback", { locationLike });
  return `${callbackPath}${search}${hash}`;
}

export function buildWorkspaceUrl(
  path = "/chat",
  options: {
    handoffToken?: string;
    locationLike?: LocationLike;
  } = {}
) {
  const { handoffToken, locationLike = window.location } = options;
  const origin = getWorkspaceOrigin(locationLike);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${origin}${normalizedPath}`);

  if (LOCAL_HOSTS.has(locationLike.hostname)) {
    url.searchParams.set("app", WORKSPACE_QUERY_VALUE);
  }

  if (handoffToken) {
    url.searchParams.set("handoff", handoffToken);
  }

  return url.toString();
}
