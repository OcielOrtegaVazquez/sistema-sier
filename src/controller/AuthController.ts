import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { Users } from '../entity/Users';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';
import { validate } from 'class-validator';

/* Autenticacion para Logueo */
class AuthController {
  static login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).json({ message: ' Usuario Y Password Requeridos!' });
    }

    const userRepository = getRepository(Users);
    let user: Users;

    try {
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch (e) {
      return res.status(400).json({ message: ' Usuario y/o Password Incorrectos!' });
    }

    // Verificar el Password
    if (!user.checkPassword(password)) {
      return res.status(400).json({ message: ' Usuario y/o Password Incorrectos!' });
    }

    /* Generamos Token */
    const token = jwt.sign({ userId: user.id, username: user.username }, config.jwtSecret, { expiresIn: '1h' });

    res.json({ message: 'OK', token, userId: user.id, role: user.role });
  };

  /* Cambiar el Password */
  static changePassword = async (req: Request, res: Response) => {
    const { userId } = res.locals.jwtPayload;
    const { oldPassword, newPassword } = req.body;

    /* Verificar que los campos tengan datos */
    if (!(oldPassword && newPassword)) {
      res.status(400).json({ message: 'Password anterio Y Password Nuevos Requeridos!' });
    }

    const userRepository = getRepository(Users);
    let user: Users;

    /* Verificar los dos campos */
    try {
      user = await userRepository.findOneOrFail(userId);
    } catch (e) {
      res.status(400).json({ message: 'Algo No Salió Bien!' });
    }

    if (!user.checkPassword(oldPassword)) {
      return res.status(401).json({ message: 'Verifica Tu Anterior Password!' });
    }

    user.password = newPassword;
    const validationOps = { validationError: { target: false, value: false } };
    const errors = await validate(user, validationOps);

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // Hash password
    user.hashPassword();
    userRepository.save(user);

    res.json({ message: 'Password Actualizado!' });
  };
}

export default AuthController;
