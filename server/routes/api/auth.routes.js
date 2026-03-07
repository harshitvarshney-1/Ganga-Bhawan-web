import express from 'express';
import loginController from '../../controllers/auth/login.controller';
import registerController from '../../controllers/auth/register.controller';

const authRouter = express.Router();

authRouter.post('/register', registerController);
authRouter.post('/login', loginController);

export default authRouter;
