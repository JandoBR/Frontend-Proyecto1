import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary
      title="Órbita se trabó"
      description="Algo falló fuera de lo esperado. Recarga o vuelve al inicio para seguir navegando."
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
