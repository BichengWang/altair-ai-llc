import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRoot from "./AppRoot";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import "./workspace.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <AppRoot />
        </AuthProvider>
      </BrowserRouter>
  </StrictMode>
);
