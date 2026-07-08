// ============================================================================
// server/src/index.ts — Express entry point
// ----------------------------------------------------------------------------
// PURPOSE
//   Boot the HTTP server and wire up the two route modules. This file should
//   stay tiny: no business logic, just plumbing.
//
// WHAT GOES IN HERE
//   1. Create the Express app.
//   2. app.use(express.json()) — the /api/gif endpoint receives a JSON body.
//   3. Mount routes:
//        app.use('/api/albums', albumsRouter)   → routes/albums.ts
//        app.use('/api/gif',    gifRouter)      → routes/gif.ts
//   4. A catch-all error handler middleware (err, req, res, next) so route
//      code can just `next(err)` and every failure returns consistent JSON:
//      { error: "message" } with an appropriate status code.
//   5. app.listen(PORT) — use process.env.PORT || 3001.
//      3001 matters: the Vite dev proxy (client/vite.config.ts) points at it.
//
// LINKS WITH
//   - routes/albums.ts  (album search)
//   - routes/gif.ts     (GIF generation)
//   - client/vite.config.ts (proxies /api → this server in dev)
//
// NOTES
//   - No CORS middleware needed in dev thanks to the Vite proxy. If you ever
//     call this server from a different origin directly, add the `cors` pkg.
//   - PRODUCTION (later): serve the built client with
//     express.static('../client/dist') + an index.html fallback.
// ============================================================================

import express from 'express';
// import albumsRouter from './routes/albums';
// import gifRouter from './routes/gif';

// TODO: create app, add JSON body parsing, mount routers, error handler, listen.
