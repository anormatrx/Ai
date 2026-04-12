import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { systemRoutes } from './routes/system.routes';
import { chatRoutes } from './routes/chat.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', time: new Date().toISOString() });
});

app.use('/api', systemRoutes);
app.use('/api', chatRoutes);

const port = Number(process.env.PORT || 3002);
app.listen(port, '127.0.0.1', () => {
  console.log(`Backend running at http://127.0.0.1:${port}`);
});