import { BrowserRouter } from "react-router-dom";
import { AppErrorBoundary } from "../components/AppErrorBoundary.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";

/**
 * Composes application-wide providers in one place.
 *
 * Feature components should consume these providers instead of creating their
 * own router, authentication, or top-level error boundaries.
 */
export function AppProviders({ children }) {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
