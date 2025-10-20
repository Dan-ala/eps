const Appointment = require('../models/appointment');

module.exports = {
    getAll(req, res) {
        Appointment.findAll((err, appointments) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener citas',
                    error: err
                });
            }
            res.status(200).json({
                success: true,
                message: 'Lista de citas',
                data: appointments
            });
        });
    },

    getById(req, res) {
        const appointmentId = parseInt(req.params.appointmentId, 10);
        if (isNaN(appointmentId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de cita inválido'
            });
        }

        Appointment.findById(appointmentId, (err, appointment) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener cita',
                    error: err
                });
            }
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Cita no encontrada'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Cita encontrada',
                data: appointment
            });
        });
    },

    create(req, res) {
        const appointment = req.body;
        Appointment.create(appointment, (err, data) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al crear la cita',
                    error: err
                });
            }
            res.status(201).json({
                success: true,
                message: 'Cita creada correctamente',
                data: data
            });
        });
    },

    update(req, res) {
        const appointment = req.body;
        Appointment.update(appointment, (err, data) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al actualizar la cita',
                    error: err
                });
            }
            res.status(200).json({
                success: true,
                message: 'Cita actualizada',
                data: data
            });
        });
    },

    delete(req, res) {
        const appointmentId = parseInt(req.params.appointmentId, 10);
        if (isNaN(appointmentId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de cita inválido'
            });
        }

        Appointment.delete(appointmentId, (err, data) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar la cita',
                    error: err
                });
            }
            res.status(200).json({
                success: true,
                message: 'Cita eliminada correctamente',
                data: data
            });
        });
    }
};
