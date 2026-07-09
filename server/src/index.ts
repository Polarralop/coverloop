import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import albumsRouter from './routes/albums';
import gifRouter from './routes/gif';

const app = express();
app.use(express.json());

app.use('/api/albums', albumsRouter);
app.use('/api/gif', gifRouter)

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => { // error handler
    console.error(err);
    res.status(500).json({ error: err.message ?? 'something went wrong...' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}.`);
});
