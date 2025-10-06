const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

// GET /api/usuarios/exportar - Exportar usuarios a CSV o JSON
router.get('/exportar', UserController.exportUsers);

// POST /api/usuarios - Crear usuario
router.post('/', UserController.createUser);

// GET /api/usuarios - Obtener todos los usuarios (con cache)
router.get('/', UserController.getAllUsers);

// GET /api/usuarios/:id - Obtener usuario por ID (con cache)
router.get('/:nro_documento', UserController.getUserById);

// PUT /api/usuarios/:nro_documento - Actualizar usuario
router.put('/:nro_documento', UserController.updateUser);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', UserController.deleteUser);

module.exports = router;