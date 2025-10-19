const Provider = require('../models/provider');
const User = require('../models/user');

module.exports = {
linkProvider(req, res) {
        // 1. Get data and validate IDs
        const { usersId, specialty } = req.body; 

        if (!usersId || !specialty) {
            return res.status(400).json({ 
                success: false, 
                message: 'El usersId y la especialidad son obligatorios.' 
            });
        }
        
        const id = parseInt(usersId, 10);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'ID de usuario inválido.' });
        }

        // STEP 1: Find the existing user
        User.findById(id, (err, user) => {
            if (err) {
                console.error('Error finding user for linking (DB error):', err);
                return res.status(500).json({ success: false, message: 'Error de base de datos al buscar usuario.', error: err });
            }
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
            }
            
            // STEP 2: Check if a provider profile already exists for this user
            Provider.findByUserId(id, (err, existingProvider) => {
                if (err) {
                    console.error('Error finding existing provider profile (DB error):', err);
                    return res.status(500).json({ success: false, message: 'Error de base de datos al verificar perfil de proveedor.', error: err });
                }
                
                if (existingProvider) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Este usuario ya tiene un perfil de proveedor registrado. Solo puede tener uno.' 
                    });
                }
                
                // STEP 3: Update User Role (only if necessary)
                // This updates the user's role in the 'users' table if it's not already 'provider'.
                const updateRole = user.role !== 'provider';

                const createProviderProfile = () => {
                     // STEP 4: Create the Provider record
                    Provider.create({ usersId: id, specialty }, (err, providerData) => {
                        if (err) { 
                            console.error('Error creating provider record (DB error):', err);
                            return res.status(500).json({ 
                                success: false, 
                                message: 'Error de base de datos al crear el perfil de proveedor.', 
                                error: err 
                            });
                        }
                        
                        // Success: Combine the data
                        delete user.password;
                        // Use the updated role from the function scope
                        user.role = 'provider'; 
                        const responseData = { ...user, ...providerData };
                        
                        return res.status(200).json({ 
                            success: true, 
                            message: `Perfil de proveedor vinculado. Rol actualizado: ${updateRole ? 'Sí' : 'No'}.`, 
                            data: responseData 
                        });
                    });
                };
                
                if (updateRole) {
                    user.role = 'provider';
                    User.update(user, (err) => {
                        if (err) {
                            console.error('Error updating user role:', err);
                            return res.status(500).json({ success: false, message: 'Error de base de datos al actualizar el rol.', error: err });
                        }
                        // Proceed to create the provider profile after successful role update
                        createProviderProfile();
                    });
                } else {
                    // Role was already 'provider', proceed directly to profile creation
                    createProviderProfile();
                }
            });
        });
    },
};