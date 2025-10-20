import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const ProvidersTable = () => {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProviders = async () => {
            const token = localStorage.getItem('userToken');
            
            if (!token) {
                setError('Token de autenticación no encontrado. Por favor, inicie sesión.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('/api/providers', {
                    headers: {
                        // Assuming your backend uses this structure for Authorization
                        'Authorization': `${token}` 
                    }
                });
                
                // 🔑 CRITICAL: Store the data from the API response into the state
                // Assuming the structure is { success: true, data: [...] } based on your controller
                if (response.data.success) {
                    setProviders(response.data.data); // <--- CORRECTION HERE
                } else {
                    // Handle case where success is false but no error was thrown
                    setError(response.data.message || 'Error desconocido al cargar proveedores.');
                }
            } catch (err) {
                const errMsg = err.response?.data?.message || 'Error al cargar la lista de doctores.';
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

        fetchProviders();
    }, [navigate]); // Added navigate to dependencies for completeness

    if (loading) {
        return <div className="text-center mt-4 text-indigo-600">Cargando doctores...</div>;
    }

    if (error) {
        return <div className="text-center mt-4 text-red-600">Error: {error}</div>;
    }
    
    const signup = () =>{
        navigate(`/admin/link-provider`);
    }

    // Helper function to render the image component (used in both desktop and mobile views)
    const renderProviderImage = (provider) => (
        <img 
            src={provider.image} 
            alt={`${provider.name} ${provider.lastname} profile`} 
            className="h-10 w-10 rounded-full object-cover shadow-md border-2 border-indigo-300"
            onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://placehold.co/40x40/7C3AED/FFFFFF?text=A'; 
            }}
        />
    );

    // If providers list is empty after loading
    if (providers.length === 0) {
        return (
            <div className="text-center mt-10 p-6 bg-yellow-50 rounded-lg">
                <p className="text-lg text-yellow-800">No se encontraron doctores registrados.</p>
                <button 
                    onClick={signup} 
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    Agregar el primer Doctor
                </button>
            </div>
        );
    }

    return (
        <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard Doctores</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-600">Panel de Doctores</h3>
            <p>Gestión de doctores</p>
        <div className="mt-8 p-4 md:p-8">
            <h4 className="text-xl font-bold mb-4 text-gray-800">Doctores del Sistema</h4>
            
            <div className="mb-6 flex justify-end">
                <button 
                    onClick={signup} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Agregar Doctor
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Especialidad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Teléfono</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Foto</th> 
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {providers.map((provider) => (
                            <tr key={provider.usersId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{provider.usersId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{provider.name} {provider.lastname}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{provider.specialty}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{provider.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{provider.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {renderProviderImage(provider)}
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
                {providers.map((provider) => (
                    <div 
                        key={provider.usersId} 
                        className="bg-white p-4 rounded-lg shadow-md border border-gray-200 transition duration-300 hover:border-indigo-500"
                    >
                        <div className="flex justify-between items-start mb-3">
                            {/* Left: Name and ID */}
                            <div>
                                <h5 className="text-base font-semibold text-indigo-700 truncate">
                                    {provider.name} {provider.lastname}
                                </h5>
                                <p className="text-xs text-gray-500">ID: {provider.usersId}</p>
                            </div>
                            {/* Right: Image */}
                            <div className="flex-shrink-0">
                                {renderProviderImage(provider)}
                            </div>
                        </div>

                        {/* Details Stacked */}
                        <div className="space-y-1 text-sm">
                            <p className="flex justify-between">
                                <span className="font-medium text-gray-600">Email:</span>
                                <span className="text-gray-800">{provider.email}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="font-medium text-gray-600">Teléfono:</span>
                                <span className="text-gray-800">{provider.phone}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="font-medium text-gray-600">Especialidad:</span>
                                <span className="text-gray-800">{provider.specialty}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
        </div>
        </div>
    );
};

export default ProvidersTable;