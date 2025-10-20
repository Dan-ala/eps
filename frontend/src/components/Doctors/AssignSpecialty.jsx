import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const AssignSpecialty = () => {
    const navigate = useNavigate();
    
    const [potentialProviders, setPotentialProviders] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [specialty, setSpecialty] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // --- Obtener Usuarios Pendientes de Especialidad ---
    const fetchPotentialProviders = async () => {
        setLoading(true);
        const token = localStorage.getItem('userToken'); 
        
        if (!token) {
            setError('Error de autenticación. Por favor, inicie sesión de nuevo como administrador.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('api/providers/potential', { 
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setPotentialProviders(response.data.data || []);
            
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Error al cargar usuarios pendientes de especialidad.';
            setError(errMsg);
            console.error('Fetch Error:', err.response || err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPotentialProviders();
    }, []);

    // --- Asignar la Especialidad (POST) ---
    const handleAssignSpecialty = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const token = localStorage.getItem('userToken');

        if (!selectedUser || !specialty.trim()) {
            Swal.fire('Advertencia', 'Debe seleccionar un usuario y escribir una especialidad válida.', 'warning');
            setSubmitting(false);
            return;
        }

        try {
            await axios.post('/api/', {
                usersId: selectedUser.usersId,
                specialty: specialty.trim()
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            await Swal.fire({
                icon: 'success',
                title: 'Asignación Exitosa',
                text: `Especialidad "${specialty}" asignada a ${selectedUser.name} ${selectedUser.lastname}.`,
                confirmButtonText: 'Ver Doctores'
            });
            
            navigate('/admin/providers'); // Redirige a la lista principal de Doctores

        } catch (err) {
            const errMsg = err.response?.data?.message || 'Error al asignar la especialidad. Verifique si el usuario ya está vinculado.';
            Swal.fire({
                icon: 'error',
                title: 'Fallo al Asignar',
                text: errMsg,
            });
        } finally {
            setSubmitting(false);
        }
    };

    // --- Renderizado de Estados ---
    if (loading) {
        return <div className="text-center mt-10 text-indigo-600">Cargando usuarios pendientes...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-600 p-4 bg-red-100 border border-red-300 rounded-lg max-w-lg mx-auto">Error: {error}</div>;
    }

    return (
        <div className="flex justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-3xl p-8 bg-white shadow-2xl rounded-xl">
                <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-700">Asignar Especialidad de Proveedor</h2>
                
                {/* 1. LISTADO DE USUARIOS PENDIENTES */}
                <div className="mb-8 border-b pb-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">1. Seleccionar Doctor a Vincular ({potentialProviders.length} pendientes)</h3>
                    
                    {potentialProviders.length === 0 ? (
                        <div className="p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
                            🎉 ¡Todos los usuarios con rol "Doctor/Proveedor" ya tienen una especialidad asignada!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                            {potentialProviders.map(user => (
                                <div 
                                    key={user.usersId} 
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setSpecialty('');
                                    }}
                                    className={`p-4 border rounded-lg cursor-pointer transition duration-200 shadow-sm
                                        ${selectedUser?.usersId === user.usersId 
                                            ? 'bg-indigo-200 border-indigo-600 ring-2 ring-indigo-500' 
                                            : 'bg-white hover:bg-indigo-50 border-gray-200'}`}
                                >
                                    <p className="font-bold text-indigo-800">{user.name} {user.lastname}</p>
                                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                                    <p className="text-xs text-gray-500 mt-1">ID: {user.usersId}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. FORMULARIO DE ASIGNACIÓN */}
                {selectedUser && (
                    <form onSubmit={handleAssignSpecialty} className="space-y-6 p-6 border border-indigo-400 rounded-lg bg-indigo-50">
                        <h3 className="text-xl font-semibold text-gray-800">2. Asignar Especialidad</h3>
                        <p className="text-lg font-medium text-gray-700">
                            Asignando especialidad a: <span className="font-bold text-indigo-600">{selectedUser.name} {selectedUser.lastname} (ID: {selectedUser.usersId})</span>
                        </p>

                        <div>
                            <label htmlFor="specialty" className="block text-sm font-semibold text-gray-700">Especialidad Requerida</label>
                            <input
                                id="specialty"
                                type="text"
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Ej: Cardiólogo, Pediatría"
                                disabled={submitting}
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={submitting || !specialty.trim()}
                            className={`w-full py-3 px-4 rounded-lg shadow-lg font-semibold transition duration-300 flex justify-center items-center
                                ${submitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                        >
                            {submitting ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Guardar Especialidad y Vincular'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AssignSpecialty;