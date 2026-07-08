// ============================================================================
// vite.config.ts — dev server config
// ----------------------------------------------------------------------------
// PURPOSE
//   The one important thing here is the /api proxy: during development the
//   React app runs on :5173 and Express on :3001. Proxying means the client
//   code can just call fetch('/api/...') with no CORS setup and no hardcoded
//   host — and the same relative paths keep working in production if you
//   serve the built client from Express.
//
// LINKS WITH
//   - client/src/api/client.ts  (all requests go to /api/*)
//   - server/src/index.ts       (Express listens on PORT below)
// ============================================================================
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
