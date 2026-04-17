import express from 'express';
import { publicSettings, saveSettings } from '../services/settings.service';
import { chatRoutes } from './chat.routes';
import { systemRoutes } from './system.routes';
import localChatRouter from './local-chat';
import pythonAgentRouter from './python-agent';
import pythonToolsRouter from './python-tools';
import unifiedChatRouter from './unified-chat';
import simpleRoutes from './simple';

const router = express.Router();

// Mount simpleRoutes directly at all paths
router.use(simpleRoutes);

// Mount system routes
router.use('/system', systemRoutes);

// Other routes
router.use('/chat', chatRoutes);
router.use('/ollama', chatRoutes);
router.use('/providers', chatRoutes);
router.use('/local-chat', localChatRouter);
router.use('/python-agent', pythonAgentRouter);
router.use('/python-tools', pythonToolsRouter);
router.use('/unified-chat', unifiedChatRouter);

export default router;
