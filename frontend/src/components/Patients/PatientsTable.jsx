import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // Added icon imports

const PatientsTable = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to re-fetch data (centralized to keep code DRY)
    const fetchPatients = async () => {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            setError('Token de autenticación no encontrado. Por favor, inicie sesión.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('/api/users', {
                headers: {
                    'Authorization': `${token}` 
                }
            });

            // Filter the list to only include users with the 'patient' role
            const patientList = response.data.data.filter(user => user.role === 'patient');
            setPatients(patientList);

        } catch (err) {
            const errMsg = err.response?.data?.message || 'Error al cargar la lista de pacientes.';
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

    useEffect(() => {
        fetchPatients();
    }, []);

    const signup = () =>{
        navigate(`/signup`);
    }

    // ------------------------------------------------------------------
    // DELETE ACTION HANDLER
    // ------------------------------------------------------------------
    const handleDeletePatient = async (patientId) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir la eliminación de este paciente!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const token = localStorage.getItem('userToken');
            
            try {
                // API Call: DELETE /api/users/delete/:usersId
                await axios.delete(`/api/users/delete/${patientId}`, {
                    headers: {
                        'Authorization': `${token}`
                    }
                });

                // Update the state to remove the deleted patient instantly
                setPatients(prevPatients => prevPatients.filter(patient => patient.usersId !== patientId));

                Swal.fire(
                    'Eliminado!',
                    'El paciente ha sido eliminado con éxito.',
                    'success'
                );
            } catch (err) {
                const errMsg = err.response?.data?.message || 'Error al eliminar el paciente.';
                Swal.fire('Error', errMsg, 'error');
            }
        }
    };
    
    // ------------------------------------------------------------------
    // EDIT ACTION HANDLER (Navigation)
    // ------------------------------------------------------------------
    const handleEditPatient = (patientId) => {
        // Navigate to the new patient edit route
        navigate(`/admin/patients/edit/${patientId}`);
    };
    
    // Helper function to render action buttons
    const renderActionButtons = (patientId) => (
        <div className="flex space-x-2">
            <button 
                onClick={() => handleEditPatient(patientId)} 
                className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 transition duration-150"
                title="Editar Paciente"
            >
                <FaEdit className="w-5 h-5" /> 
            </button>
            <button 
                onClick={() => handleDeletePatient(patientId)} 
                className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition duration-150"
                title="Eliminar Paciente"
            >
                <FaTrashAlt className="w-5 h-5" />
            </button>
        </div>
    );

    // Helper function to render the image component (used in both desktop and mobile views)
    const renderPatientImage = (patient) => (
        <img 
            src={patient.image} 
            alt={`${patient.name} ${patient.lastname} profile`} 
            className="h-10 w-10 rounded-full object-cover shadow-md border-2 border-indigo-300"
            onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://placehold.co/40x40/7C3AED/FFFFFF?text=P'; // Changed placeholder text to 'P' for Patient
            }}
        />
    );


    if (loading) {
        return <div className="text-center mt-4 text-indigo-600">Cargando pacientes...</div>;
    }

    if (error) {
        return <div className="text-center mt-4 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard Pacientes</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-600">Panel de Pacientes</h3>
            <p>Gestión de pacientes</p>
        <div className="mt-8 p-4 md:p-8">
            <h4 className="text-xl font-bold mb-4 text-gray-800">Pacientes del Sistema</h4>
            
            <div className="mb-6 flex justify-end">
                <button 
                    onClick={signup} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Agregar Paciente
                </button>
            </div>
            
            {/* ---------------------------------------------------- */}
            {/* 1. DESKTOP VIEW (Visible on Small screens and up) */}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Acciones</th> 
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {patients.map((patient) => (
                            <tr key={patient.usersId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.usersId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.name} {patient.lastname}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {renderPatientImage(patient)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {renderActionButtons(patient.usersId)}
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
                {patients.map((patient) => (
                    <div 
                        key={patient.usersId} 
                        className="bg-white p-4 rounded-lg shadow-md border border-gray-200 transition duration-300 hover:border-indigo-500"
                    >
                        <div className="flex justify-between items-start mb-3">
                            {/* Left: Name and ID */}
                            <div>
                                <h5 className="text-base font-semibold text-indigo-700 truncate">
                                    {patient.name} {patient.lastname}
                                </h5>
                                <p className="text-xs text-gray-500">ID: {patient.usersId}</p>
                            </div>
                            {/* Right: Image and Actions */}
                            <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                                {renderPatientImage(patient)}
                                <div className="pt-2"> 
                                    {renderActionButtons(patient.usersId)}
                                </div>
                            </div>
                        </div>

                        {/* Details Stacked */}
                        <div className="space-y-1 text-sm">
                            <p className="flex justify-between">
                                <span className="font-medium text-gray-600">Email:</span>
                                <span className="text-gray-800">{patient.email}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="font-medium text-gray-600">Teléfono:</span>
                                <span className="text-gray-800">{patient.phone}</span>
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

export default PatientsTable;
