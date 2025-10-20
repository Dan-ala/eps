const db = require('../config/config');
const Appointment = {};

Appointment.findAll = (result) => {
    const sql = `
        SELECT 
            a.appointmentId,
            a.usersId,
            a.providerId,
            a.appointmentDate,
            a.appointmentTime,
            a.reason,
            a.status,
            a.createdAt,
            CONCAT(u.name, ' ', u.lastname) AS patient_name,
            CONCAT(up.name, ' ', up.lastname) AS provider_name,
            pr.specialty AS provider_specialty
        FROM appointments a
        JOIN users u ON a.usersId = u.usersId
        JOIN providers pr ON a.providerId = pr.providerId
        JOIN users up ON pr.usersId = up.usersId
        ORDER BY a.appointmentDate DESC
    `;

    db.query(sql, (err, res) => {
        if (err) {
            console.log('❌ Error fetching appointments:', err);
            result(err, null);
        } else {
            console.log('✅ Appointments fetched:', res.length);
            result(null, res);
        }
    });
};

Appointment.findById = (id, result) => {
    const sql = `
        SELECT 
            a.appointmentId,
            a.usersId,
            a.providerId,
            a.appointmentDate,
            a.appointmentTime,
            a.reason,
            a.status,
            a.createdAt,s
            CONCAT(u.name, ' ', u.lastname) AS patient_name,
            CONCAT(up.name, ' ', up.lastname) AS provider_name,
            pr.specialty AS provider_specialty
        FROM appointments a
        JOIN users u ON a.usersId = u.usersId
        JOIN providers pr ON a.providerId = pr.providerId
        JOIN users up ON pr.usersId = up.usersId
        WHERE a.appointmentId = ?
    `;

    db.query(sql, [id], (err, res) => {
        if (err) {
            console.log('❌ Error fetching appointment by ID:', err);
            result(err, null);
        } else if (res.length === 0) {
            console.log('⚠️ No appointment found with ID:', id);
            result(null, null);
        } else {
            result(null, res[0]);
        }
    });
};

Appointment.create = (appointment, result) => {
    const sql = `
        INSERT INTO appointments (
            usersId,
            providerId,
            appointmentDate,
            appointmentTime,
            reason,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            appointment.usersId,
            appointment.providerId,
            appointment.appointmentDate,
            appointment.appointmentTime,
            appointment.reason,
            appointment.status || 'scheduled'
        ],
        (err, res) => {
            if (err) {
                console.log('❌ Error creating appointment:', err);
                result(err, null);
            } else {
                console.log('✅ Appointment created:', { appointmentId: res.insertId, ...appointment });
                result(null, { appointmentId: res.insertId, ...appointment });
            }
        }
    );
};

Appointment.update = (appointment, result) => {
    const sql = `
        UPDATE appointments
        SET 
            usersId = ?, 
            providerId = ?, 
            appointmentDate = ?, 
            appointmentTime = ?, 
            reason = ?, 
            status = ?
        WHERE appointmentId = ?
    `;

    db.query(
        sql,
        [
            appointment.usersId,
            appointment.providerId,
            appointment.appointmentDate,
            appointment.appointmentTime,
            appointment.reason,
            appointment.status,
            appointment.appointmentId
        ],
        (err, res) => {
            if (err) {
                console.log('❌ Error updating appointment:', err);
                result(err, null);
            } else {
                console.log('✅ Appointment updated:', appointment.appointmentId);
                result(null, { appointmentId: appointment.appointmentId, ...appointment });
            }
        }
    );
};

Appointment.delete = (id, result) => {
    const sql = `DELETE FROM appointments WHERE appointmentId = ?`;
    db.query(sql, [id], (err, res) => {
        if (err) {
            console.log('❌ Error deleting appointment:', err);
            result(err, null);
        } else {
            console.log('✅ Appointment deleted:', id);
            result(null, res);
        }
    });
};

module.exports = Appointment;
