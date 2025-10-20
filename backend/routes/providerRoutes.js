const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Rutas públicas

// Rutas protegidas
router.post('/link', verifyToken, authorizeRoles(['admin']), providerController.linkProvider);
router.get(
    '/potential', 
    verifyToken, 
    authorizeRoles(['admin']), 
    providerController.getPotentialProviders
);
router.get('/', verifyToken, authorizeRoles(['admin','provider']), providerController.getAllProviders);

module.exports = router;