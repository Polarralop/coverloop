import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import albumsRouter from './routes/albums';
import gifRouter from './routes/gif';

// App construction lives here, separate from listening (index.ts), so tests
// can drive the real routes with supertest without binding a port.
const app = express();

// Only the deployed client may call this API cross-origin. Add more origins
// (e.g. a custom domain) to the array as needed. Dev uses the Vite proxy, so
// it's same-origin and never hits CORS.
const allowedOrigins = ['https://coverloop.vercel.app'];
app.use(cors({ origin: allowedOrigins }));

app.use(express.json());

app.use('/api/albums', albumsRouter);
app.use('/api/gif', gifRouter)

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => { // error handler
    console.error(err);
    res.status(500).json({ error: err.message ?? 'something went wrong...' });
});

export default app;
