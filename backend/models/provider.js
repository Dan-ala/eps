const db = require('../config/config')
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

Provider.findByUserId = (id, result) => {
    const sql = `SELECT * FROM providers WHERE usersId = ?`;

    db.query(sql, [id], (err, provider) => {
        if (err) {
            return result(err, null);
        }
        
        // Return the profile object if found, otherwise return null
        return result(null, provider.length ? provider[0] : null); 
    });
};

Provider.create = async (user, result) => {
    const sql = `INSERT INTO providers(
                    usersId, 
                    specialty
                ) VALUES (?,?)`;
    db.query(sql,
        [
            user.usersId,
            user.specialty,
        ], (err, res) => {
            if (err) {
                console.log('Error al crear al Doctor: ', err);
                result(err, null);
            } else {
                console.log('Doctor creado: ', {providerId: res.insertId, ...user});
                result(null, {providerId: res.insertId, ...user});
            }
        }
    );
};

module.exports = Provider;