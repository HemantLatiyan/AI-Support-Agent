import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import cors from 'cors';
import chatRoutes from './routes/chat.routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '16kb' }));

app.get('/health', (_, res) => {
    res.json({ status: 'ok' });
});

app.use('/chat', chatRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found.' });
});

// Global error handler (catches anything thrown without a res.json)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
