import { Router } from 'express';
import { handleMidtransWebhook } from '../controllers/webhook';

const router = Router();

// tidak perlu autentikasi, karena verifikasi langsung dari midtrans
router.post('/midtrans', handleMidtransWebhook);

export default router;