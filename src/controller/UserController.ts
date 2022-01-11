import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { Users } from '../entity/Users';
import { validate } from 'class-validator';

export class UserController {

  /* Obtener todos los usuarios */
  static getAll = async (req: Request, res: Response) => {
    const userRepository = getRepository(Users);
    let users;

    try {
      users = await userRepository.find({ select: ['id', 'username', 'role'] });
    } catch (e) {
      res.status(404).json({ message: 'Algo Salió Mal!' });
    }

    if (users.length > 0) {
      res.send(users);
    } else {
      res.status(404).json({ message: 'Sin Resultados' });
    }
  };

  /* Obtener usuario por Id */
  static getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRepository = getRepository(Users);
    try {
      const user = await userRepository.findOneOrFail(id);
      res.send(user);
    } catch (e) {
      res.status(404).json({ message: 'Sin Resultados' });
    }
  };

  /* Crear nuevo Usuario */
  static new = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;
    const user = new Users();

    user.username = username;
    user.password = password;
    user.role = role;

    // Validar que no exista
    const validationOpt = { validationError: { target: false, value: false } };
    const errors = await validate(user, validationOpt);
    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // TODO: HASH PASSWORD

    const userRepository = getRepository(Users);
    try {
      user.hashPassword();
      await userRepository.save(user);
    } catch (e) {
      return res.status(409).json({ message: 'Usuario Actualmente En Uso' });
    }
    // Si todo se creo correctamente
    res.send('Usuario Creado Correctamente!');
  };

  /* Editar Usuario */
  static edit = async (req: Request, res: Response) => {
    let user;
    const { id } = req.params;
    const { username, role } = req.body;

    const userRepository = getRepository(Users);

    // Obtenemos el usuario a modificar
    try {
      user = await userRepository.findOneOrFail(id);
      user.username = username;
      user.role = role;
    } catch (e) {
      return res.status(404).json({ message: 'Usuario No Encontrado!' });
    }
    const validationOpt = { validationError: { target: false, value: false } };
    const errors = await validate(user, validationOpt);

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // Intentar Guardar Cambios
    try {
      await userRepository.save(user);
    } catch (e) {
      return res.status(409).json({ message: 'Nombre de Usuario ya Existe!' });
    }
    /* Si todo salio Bien */
    res.status(201).json({ message: 'Usuario Actualizado!' });
  };

  /* Borrar usuario */
  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRepository = getRepository(Users);
    let user: Users;

    /* Buscar al usuario */
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (e) {
      return res.status(404).json({ message: 'Usuario No Encontrado!' });
    }

    // Si todo salio bien
    userRepository.delete(id);
    res.status(201).json({ message: ' Usuario Eliminado Correctamente' });
  };
}

export default UserController;
