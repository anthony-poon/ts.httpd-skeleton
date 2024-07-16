import express from 'express';

import { UserAuthority } from '@entity/user.entity';
import authMiddleware from '../../middleware/auth';

const userRoute = express.Router();

const auth = authMiddleware.require(UserAuthority.USER);

userRoute.get('/heartbeat', auth, (req, res) => {
  res.json({
    status: 'ok',
  });
});

export default userRoute;
