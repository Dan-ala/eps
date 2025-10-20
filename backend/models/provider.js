const db = require('../config/config')
const Provider = {};

Provider.findAll = (result) => {
    const sql = `
        SELECT 
            u.usersId,
            u.name,
            u.lastname,
            u.email,
            u.phone,
            u.image,
            p.specialty
        FROM 
            users u
        INNER JOIN 
            providers p ON u.usersId = p.usersId
    `;
    
    db.query(sql, (err, providers) => {
        if (err) {
            console.log('Error al listar providers: ', err);
            result(err, null);
        } else {
            console.log('Providers encontrados: ', providers.length);
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

Provider.findUsersWithoutSpecialty = (result) => {
    // Busca usuarios con rol 'provider' que NO tienen un registro en la tabla 'providers'
    const sql = `
SELECT u.usersId, u.name, u.lastname, u.email, u.phone FROM users u LEFT JOIN providers p ON u.usersId = p.usersId WHERE p.providerId IS NULL and role = "provider";
`;
    
    db.query(sql, (err, users) => {
        if (err) {
            console.log('Error al listar usuarios sin especialidad: ', err);
            return result(err, null);
        }
        console.log('Usuarios sin especialidad encontrados: ', users.length);
        result(null, users);
    });
};

Provider.create = (newProvider, result) => {
    // newProvider debe contener { usersId: INT, specialty: STRING }
    db.query("INSERT INTO providers SET ?", newProvider, (err, res) => {
        if (err) {
            console.log("Error al crear registro de proveedor: ", err);
            return result(err, null);
        }
        
        // Devuelve el ID del nuevo registro de proveedor y los datos insertados
        result(null, { providerId: res.insertId, ...newProvider });
    });
};

module.exports = Provider;