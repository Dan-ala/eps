const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/create', userController.register);
router.post('/login', userController.login);

// Rutas protegidas
router.get('/', verifyToken, authorizeRoles(['admin']), userController.getAllUsers);
router.get('/:usersId', verifyToken, authorizeRoles(['admin']), userController.getUserById);
router.put('/:id', verifyToken, authorizeRoles(['admin', 'patient', 'provider']), userController.getUserUpdate);
router.delete('/delete/:usersId', verifyToken, authorizeRoles(['admin']), userController.getUserDelete);

module.exports = router;