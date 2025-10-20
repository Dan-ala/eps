import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminEditForm = () => {
    // Get the user ID from the URL parameter (matching :usersId in your route)
    const { usersId } = useParams(); 
    const navigate = useNavigate();
    
    // State to hold the user data and form inputs
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        phone: '',
        image: '',
        role: 'admin', // Ensure the role remains 'admin'
        password: '', // Kept empty, only sent if user types a new one
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('userToken');

    // ------------------------------------------------------------------
    // 1. FETCH ADMIN DATA ON COMPONENT LOAD
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!token) {
            setError('Token de autenticación no encontrado. Por favor, inicie sesión.');
            setLoading(false);
            return;
        }

        const fetchAdminData = async () => {
            try {
                // API Call: GET /api/users/:usersId
                const response = await axios.get(`/api/users/${usersId}`, {
                    headers: {
                        'Authorization': `${token}` 
                    }
                });

                const adminData = response.data.data;

                // Load existing data into the form state
                setFormData({
                    name: adminData.name || '',
                    lastname: adminData.lastname || '',
                    email: adminData.email || '',
                    phone: adminData.phone || '',
                    image: adminData.image || '',
                    role: adminData.role || 'admin',
                    password: '', // Keep password empty
                });
                setLoading(false);

            } catch (err) {
                const errMsg = err.response?.data?.message || 'Error al cargar los datos del administrador.';
                setError(errMsg);
                setLoading(false);
                Swal.fire('Error', errMsg, 'error');
                // Optional: navigate('/dashboard') to escape
            }
        };

        fetchAdminData();
    }, [usersId, navigate, token]);

    // ------------------------------------------------------------------
    // 2. FORM HANDLERS
    // ------------------------------------------------------------------

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Prepare data: Filter out empty password if not being changed
        const dataToUpdate = { ...formData, usersId: usersId };
        if (dataToUpdate.password === '') {
            delete dataToUpdate.password;
        }

        try {
            // API Call: PUT /api/users/:usersId
            await axios.put(`/api/users/${usersId}`, dataToUpdate, {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json',
                },
            });

            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'El administrador ha sido actualizado con éxito.',
                confirmButtonText: 'Aceptar'
            });

            // Redirect back to the admin table (assuming it's available from a dashboard link)
            navigate('/dashboard'); 

        } catch (err) {
            const errMsg = err.response?.data?.message || 'Error al actualizar el administrador.';
            Swal.fire({
                icon: 'error',
                title: 'Error de Actualización',
                text: errMsg,
            });
        }
    };
    
    // ------------------------------------------------------------------
    // 3. RENDER LOGIC
    // ------------------------------------------------------------------

    if (loading) {
        return <div className="text-center mt-12 text-xl text-indigo-600">Cargando datos del administrador...</div>;
    }

    if (error) {
        return <div className="text-center mt-12 text-xl text-red-600">Error: {error}</div>;
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-xl rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Editar Administrador (ID: {usersId})</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Lastname */}
                <div>
                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input
                        type="text"
                        name="lastname"
                        id="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Image URL (Optional) */}
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">URL de Imagen</label>
                    <input
                        type="text"
                        name="image"
                        id="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Password (Optional, only for change) */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Nueva Contraseña (Dejar vacío para no cambiar)
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminEditForm;