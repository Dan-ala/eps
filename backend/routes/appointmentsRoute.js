const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Public or Protected depending on your app
router.get('/', verifyToken, authorizeRoles(['admin', 'provider', 'patient']), appointmentsController.getAll);
router.get('/:appointmentId', verifyToken, authorizeRoles(['admin', 'provider', 'patient']), appointmentsController.getById);
router.post('/create', verifyToken, authorizeRoles(['admin', 'provider', 'patient']), appointmentsController.create);
router.put('/update', verifyToken, authorizeRoles(['admin', 'provider']), appointmentsController.update);
router.delete('/delete/:appointmentId', verifyToken, authorizeRoles(['admin']), appointmentsController.delete);

module.exports = router;
