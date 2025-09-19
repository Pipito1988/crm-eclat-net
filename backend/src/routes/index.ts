import { Router } from 'express';
import authRoutes from './authRoutes';
import clientRoutes from './clientRoutes';
import serviceRoutes from './serviceRoutes';
import devisRoutes from './devisRoutes';
import statsRoutes from './statsRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/services', serviceRoutes);
router.use('/devis', devisRoutes);
router.use('/stats', statsRoutes);

export default router;
