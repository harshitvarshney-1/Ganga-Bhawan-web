import express from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';

import getTenantProfile from '../../controllers/tenant/get-profile.controller.js';
import updateTenantProfile from '../../controllers/tenant/update-profile.controller.js';

const tenantRouter = express.Router();

tenantRouter.get('/', authMiddleware, getTenantProfile);
tenantRouter.put('/', authMiddleware, updateTenantProfile);

export default tenantRouter;
