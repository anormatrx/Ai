import express from 'express';
import { publicSettings, loadSettings, saveSettings } from '../services/settings.service';
import { systemRoutes } from './system.routes';
import { chatRoutes } from './chat.routes';
const router = express.Router();

router.use('/openclw', systemRoutes);
router.use('/chat', chatRoutes);
router.use('/ollama', chatRoutes);
router.use('/providers', chatRoutes);

// Simple health endpoint under /api/health
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// Settings endpoint (masked)
router.get('/settings', (_req, res) => {
  try {
    res.json(publicSettings());
  } catch (e) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

router.post('/settings', express.json(), (req, res) => {
  try {
    const updated = saveSettings(req.body);
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: 'Invalid settings payload' });
  }
});

export default router;
