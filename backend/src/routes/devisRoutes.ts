import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { listDevis, getDevis, createDevis, updateDevis, deleteDevis } from '../controllers/devisController';

const router = Router();

router.use(authenticate);
router.get('/', listDevis);
router.get('/:id', getDevis);
router.post('/', createDevis);
router.put('/:id', updateDevis);
router.delete('/:id', deleteDevis);

export default router;
