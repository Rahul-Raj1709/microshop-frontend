/**
 * Centralized, environment-based configuration.
 *
 * Configure locally via a `.env.local` file:
 *   VITE_API_URL=http://localhost:8080
 *
 * In production, set VITE_API_URL in your hosting environment.
 */

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  // Safe fallback for local/dev only. Prefer setting VITE_API_URL explicitly.
  "http://localhost:8080";
