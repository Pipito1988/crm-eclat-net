import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController';

const router = Router();

router.use(authenticate);
router.get('/', listClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
