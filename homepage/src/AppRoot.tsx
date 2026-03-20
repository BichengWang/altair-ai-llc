import App from "./App";
import WorkspaceApp from "./apps/WorkspaceApp";
import { useLocation } from "react-router-dom";
import { detectActiveApp } from "./lib/runtime";

export default function AppRoot() {
  const location = useLocation();
  const activeApp = detectActiveApp({
    hostname: window.location.hostname,
    origin: window.location.origin,
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  });

  return activeApp === "workspace" ? <WorkspaceApp /> : <App />;
}
