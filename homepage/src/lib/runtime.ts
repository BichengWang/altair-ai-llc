export type ActiveApp = "marketing" | "workspace";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const WORKSPACE_QUERY_VALUE = "workspace";

type LocationLike = {
  hostname: string;
  origin: string;
  port?: string;
  protocol?: string;
  search?: string;
};

type BuildAppPathOptions = {
  app?: ActiveApp;
  locationLike?: LocationLike;
};

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
  const origin = locationLike.origin || `${locationLike.protocol ?? "https:"}//${locationLike.hostname}`;
  const url = new URL(path, origin);

  if (app === "workspace" && LOCAL_HOSTS.has(locationLike.hostname)) {
    url.searchParams.set("app", WORKSPACE_QUERY_VALUE);
  } else {
    url.searchParams.delete("app");
  }

  return `${url.pathname}${url.search}${url.hash}`;
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
