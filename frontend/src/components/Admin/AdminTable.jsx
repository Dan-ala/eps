import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const AdminTable = () => {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAdmins = async () => {
            const token = localStorage.getItem('userToken');
            
            if (!token) {
                setError('Token de autenticación no encontrado. Por favor, inicie sesión.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('/api/users', {
                    headers: {
                        // Assuming your backend uses this structure for Authorization
                        'Authorization': `${token}` 
                    }
                });

                // Filter the list to only include users with the 'admin' role
                const adminList = response.data.data.filter(user => user.role === 'admin');
                setAdmins(adminList);

            } catch (err) {
                const errMsg = err.response?.data?.message || 'Error al cargar la lista de usuarios.';
                setError(errMsg);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Acceso',
                    text: errMsg,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAdmins();
    }, []);

    if (loading) {
        return <div className="text-center mt-4 text-indigo-600">Cargando administradores...</div>;
    }

    if (error) {
        return <div className="text-center mt-4 text-red-600">Error: {error}</div>;
    }
    
    const signup = () =>{
        navigate(`/signup`);
    }

    // Helper function to render the image component (used in both desktop and mobile views)
    const renderAdminImage = (admin) => (
        <img 
            src={admin.image} 
            alt={`${admin.name} ${admin.lastname} profile`} 
            className="h-10 w-10 rounded-full object-cover shadow-md border-2 border-indigo-300"
            onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://placehold.co/40x40/7C3AED/FFFFFF?text=A'; 
            }}
        />
    );

    return (
        <div className="mt-8 p-4 md:p-8">
            <h4 className="text-xl font-bold mb-4 text-gray-800">Administradores del Sistema</h4>
            
            <div className="mb-6 flex justify-end">
                <button 
                    onClick={signup} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Agregar Admin
                </button>
            </div>
            
            {/* ---------------------------------------------------- */}
            {/* 1. DESKTOP VIEW (Visible on Small screens and up)   */}
            {/* ---------------------------------------------------- */}
            <div className="hidden sm:block overflow-x-auto shadow-xl rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-600">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Teléfono</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Foto</th> 
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {admins.map((admin) => (
                            <tr key={admin.usersId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.usersId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{admin.name} {admin.lastname}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{admin.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{admin.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {renderAdminImage(admin)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ---------------------------------------------------- */}
            {/* 2. MOBILE VIEW (Visible ONLY on extra-small screens) */}
            {/* ---------------------------------------------------- */}
            <div className="sm:hidden space-y-4">
                {admins.map((admin) => (
                    <div 
                        key={admin.usersId} 
                        className="bg-white p-4 rounded-lg shadow-md border border-gray-200 transition duration-300 hover:border-indigo-500"
                    >
                        <div className="flex justify-between items-start mb-3">
                            {/* Left: Name and ID */}
                            <div>
                                <h5 className="text-base font-semibold text-indigo-700 truncate">
                                    {admin.name} {admin.lastname}
                                </h5>
                                <p className="text-xs text-gray-500">ID: {admin.usersId}</p>
                            </div>
                            {/* Right: Image */}
                            <div className="flex-shrink-0">
                                {renderAdminImage(admin)}
                            </div>
                        </div>

                        {/* Details Stacked */}
                        <div className="space-y-1 text-sm">
                            <p className="flex justify-between">
                                <span className="font-medium text-gray-600">Email:</span>
                                <span className="text-gray-800">{admin.email}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="font-medium text-gray-600">Teléfono:</span>
                                <span className="text-gray-800">{admin.phone}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default AdminTable;
