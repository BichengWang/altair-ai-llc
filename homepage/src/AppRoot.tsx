import App from "./App";
import WorkspaceApp from "./apps/WorkspaceApp";
import { getActiveApp } from "./lib/runtime";

export default function AppRoot() {
  return getActiveApp() === "workspace" ? <WorkspaceApp /> : <App />;
}
