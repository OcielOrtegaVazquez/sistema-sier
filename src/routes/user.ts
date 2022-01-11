import { checkRole } from './../middlewares/role';
import { checkJwt } from './../middlewares/jwt';
import { UserController } from './../controller/UserController';
import { Router } from 'express';

const router = Router();

// Obtener todos los usuarios siendo Administrador
router.get('/', [checkJwt, checkRole(['admin'])], UserController.getAll);

// Obtener un usuario siendo Administrador
router.get('/:id', [checkJwt, checkRole(['admin'])], UserController.getById);

// Crear nuevo usaurio siendo Administrador
router.post('/', [checkJwt, checkRole(['admin'])], UserController.new);

// Editar usuario siendo Administrador
router.patch('/:id', [checkJwt, checkRole(['admin'])], UserController.edit);

// Borrar usuario siendo Administrador
router.delete('/:id', [checkJwt, checkRole(['admin'])], UserController.delete);

export default router;
