import React, { useState, useEffect } from "react";
import axios from 'axios';
import Swal from 'sweetalert2'; // <-- IMPORT SweetAlert2

const Signup = () => {
    
    // Check local storage once on load to see if the current user is an admin
    const [isAdmin, setIsAdmin] = useState(false);
    
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [phone, setPhone] = useState('');
    // Default to 'patient' for public signup
    const [role, setRole] = useState('patient'); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Standard Image URL
    const DEFAULT_IMAGE_URL = 'https://static.vecteezy.com/system/resources/previews/036/885/313/original/blue-profile-icon-free-png.png'; 

    useEffect(() => {
        // This logic checks if an ADMIN is currently logged in, allowing them to create other admins.
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'admin') {
            setIsAdmin(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        // --- Prepare Authorization Header Conditionally ---
        const token = localStorage.getItem('userToken');
        
        let headers = {};
        // Only include the token if the user is attempting to create an Admin/Provider role 
        // OR if the current user is confirmed to be an Admin creating ANY user.
        if (isAdmin || role !== 'patient') { 
            if (!token) {
                 // Prevent submission if a privileged role is selected but no token exists
                 setMessage(`Fallo: Se requiere un token de administrador para crear usuarios con el rol "${role}".`);
                 setLoading(false);
                 return;
            }
            // Add the Authorization header if we have a token
            headers['Authorization'] = `Bearer ${token}`; 
        }

        try {
            const response = await axios.post('/api/users/create', {
                name: nombre,
                lastname: apellido,
                email,
                password,
                phone,
                role,
                image: DEFAULT_IMAGE_URL 
            }, {
                headers: headers // Use the conditionally built headers object
            });

            const createdUser = response.data.data;
            
            // --- UPDATED SUCCESS HANDLER ---
            const successMessage = `Usuario ${createdUser.name} creado exitosamente con el Rol: ${createdUser.role}.`;

            // 1. Set React message state (optional, for cleanup)
            setMessage(successMessage); 

            // 2. Show SweetAlert and handle navigation
            await Swal.fire({
                icon: 'success', // Corrected typo
                title: 'Creación Exitosa',
                text: successMessage, // Use the string for the body text
                confirmButtonText: 'Regresar',
                customClass: {
                    confirmButton: 'bg-indigo-600 hover:bg-indigo-700'
                },
                buttonsStyling: false,
            }).then((result) => {
                 // 3. Navigate after the user clicks 'Regresar'
                 if (result.isConfirmed || result.isDismissed) {
                    // Assuming '/' is the desired route, perhaps the login or admin table page
                    window.history.back()
                 }
            });

            // Clear the form state after success (done before navigation, but good practice)
            setNombre('');
            setApellido('');
            setPhone('');
            setEmail('');
            setPassword('');
            setRole('patient'); // Always reset to the safest role for the next submission
            
            // Note: The message below is now optional since Swal handles the success display
            // setMessage(`Usuario ${createdUser.name} creado exitosamente con el Rol: ${createdUser.role}.`);

        } catch (error) {
            // Handle registration errors
            const errorMessage = error.response?.data?.message || 'Error de conexión o permisos insuficientes.';
            setMessage(`Fallo en la Creación de Usuario: ${errorMessage}`);
            console.error('User Creation Error:', error.response || error);
            
            // Optionally show the error with Swal too
            Swal.fire({
                icon: 'error',
                title: 'Error de Creación',
                text: errorMessage,
            });

        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="p-8 bg-white shadow-2xl rounded-xl w-full max-w-lg transition duration-500 hover:shadow-indigo-300/50">
                <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-700">Crear Nuevo Usuario</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700">Nombre</label>
                            <input
                                id="nombre"
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                                placeholder="Ej: Juan"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="apellido" className="block text-sm font-semibold text-gray-700">Apellido</label>
                            <input
                                id="apellido"
                                type="text"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                                placeholder="Ej: Pérez"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={loading}
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">Número de teléfono</label>
                            <input
                                id="phone"
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                                placeholder="Ej: 8095551234"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="role" className="block text-sm font-semibold text-gray-700">Rol</label>
                        <select 
                            name="role" 
                            id="role" 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)} 
                            required 
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                        >
                            {/* Publicly available roles */}
                            <option value="patient">Paciente</option>
                            <option value="provider">Doctor/Proveedor</option>
                            
                            {/* ADMIN ROLE OPTION: Renders ONLY if the current user is an Admin */}
                            {isAdmin && <option value="admin">Administrador</option>}

                        </select>
                        {!isAdmin && <p className="mt-1 text-xs text-gray-500">Solo los administradores pueden crear otros administradores.</p>}
                    </div>

                    <button
                        type="submit"
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold transition duration-300 ease-in-out ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white'}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Cargando...
                            </div>
                        ) : 'Crear Usuario'}
                    </button>
                </form>

                {message && (
                    <p className={`mt-6 text-center text-sm font-medium p-3 rounded-lg ${message.startsWith('Fallo') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    )
}

export default Signup;
