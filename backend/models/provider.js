const db = require('../config/config')
const bcrypt = require('bcryptjs');
const Provider = {};

Provider.findAll = (r) => {
    const sql = `SELECT * FROM providers`;
    db.query(sql, (err, providers) => {
        if (err) {
            console.log('Error al listar usuarios: ', err);
            result(err, null);
        } else {
            console.log('Usuarios encontrados: ', providers.length);
            result(null, providers);
        }
    });
}

Provider.findByEmail = (email, result) => {
    const sql = `SELECT providerId, usersId, specialty, email FROM providers WHERE usersId.email = ?`;
    db.query(sql, [email], (err, user) => {
        if (err) {
            console.log('Error al consultar: ', err);
            result(err, null);
        }
        else {
            console.log('Usuario consultado: ',  user[0] );
            result(null, user[0]);
        }
    });
};