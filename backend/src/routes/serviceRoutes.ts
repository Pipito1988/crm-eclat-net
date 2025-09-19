import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController';

const router = Router();

router.use(authenticate);
router.get('/', listServices);
router.get('/:id', getService);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
