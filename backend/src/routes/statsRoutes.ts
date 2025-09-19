import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getMonthlyStats } from '../controllers/statsController';

const router = Router();

router.use(authenticate);
router.get('/monthly', getMonthlyStats);

export default router;
