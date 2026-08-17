import { Router } from 'express';
import { getPublicConfig, getAdminConfig, updateAdminConfig, getConfigHistory } from '../controllers/configController.js';
import { createEstimate } from '../controllers/estimateController.js';
import { getAdminLeads, exportLeadsCSV } from '../controllers/leadController.js';
import { login, verifyToken } from '../controllers/authController.js';
import { requireOwnerAuth } from '../middleware/auth.js';

const router = Router();

// --- Public Endpoints ---
router.get('/config', getPublicConfig);
router.post('/estimate', createEstimate);
router.post('/auth/login', login);

// --- Protected Owner / Admin Endpoints ---
router.get('/auth/verify', requireOwnerAuth, verifyToken);
router.get('/admin/config', requireOwnerAuth, getAdminConfig);
router.put('/admin/config', requireOwnerAuth, updateAdminConfig);
router.get('/admin/leads', requireOwnerAuth, getAdminLeads);
router.get('/admin/leads/export-csv', requireOwnerAuth, exportLeadsCSV);
router.get('/admin/history', requireOwnerAuth, getConfigHistory);

export default router;
