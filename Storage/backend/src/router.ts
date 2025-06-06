import express, { Router } from "express";
import multer from 'multer';

import {
	home_handler,
	auth_handler,
	prat_p_handler,
	prat_r_handler,
	prat_t_handler,
	admin_handler
} from './controller';

const storage = multer.memoryStorage();
const upload = multer({storage})

const router = Router();
router.get('/', home_handler);
router.post('/auth', auth_handler);
router.post('/prat/p/:uid', upload.single('file'), prat_p_handler);
router.post('/prat/r/:uid', prat_r_handler);
router.post('/prat/t/:uid', prat_t_handler);
router.get('/admin/aquesa/:passKey', admin_handler);

export default router;