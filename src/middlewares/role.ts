import { getRepository } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { Users } from '../entity/Users';

/* Verifica los roles de cada usuario */
export const checkRole = (roles: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.jwtPayload;
    const userRepository = getRepository(Users);
    let user: Users;

    try {
      user = await userRepository.findOneOrFail(userId);
    } catch (e) {
      return res.status(401).json({ message: 'Usuario No Autorizado' });
    }

    //Si puede o no acceder
    const { role } = user;
    if (roles.includes(role)) {
      next();
    } else {
      res.status(401).json({ message: 'Usuario No Autorizado' });
    }
  };
};
