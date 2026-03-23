import express from 'express';
import { 
  registerUser, 
  getUsers, 
  getUserByNfc, 
  getStats, 
  getLogs 
} from '../controllers/user.controller.js';

const router = express.Router();

router.post('/', registerUser);
router.get('/', getUsers);
router.get('/nfc/:nfcId', getUserByNfc);
router.get('/stats', getStats);
router.get('/logs', getLogs);

export default router;
