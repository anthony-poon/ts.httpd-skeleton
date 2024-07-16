import { NextFunction, Request, Response } from 'express';

import { UserAuthority } from '@entity/user.entity';
import { ForbiddenError, UnauthorizedError } from '../error';
import authentication from '@service/authenication';

const getJwtString = (req: Request): string => {
  const header = req.header('authorization');
  if (!header) {
    throw new UnauthorizedError('Missing authentication header');
  }
  const match = /^Bearer (.+)$/.exec(header);
  const jwt = match && match[1] ? match[1] : null;
  if (!jwt) {
    throw new UnauthorizedError('Invalid authentication header');
  }
  return jwt;
};

export const AuthMiddleware = () => {
  const require = (authority: UserAuthority) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const jwt = getJwtString(req);
        const principle = await authentication.rehydrate(jwt);
        const isAuthorized = principle.authorities.includes(authority);
        if (!isAuthorized) {
          throw new ForbiddenError('Invalid authorities');
        }
        req.auth = principle;
        next();
      } catch (e) {
        next(e);
      }
    };
  };
  return {
    require,
  };
};

const authMiddleware = AuthMiddleware();

export default authMiddleware;
