import React, { useState, useEffect, useCallback } from 'react';

// --- Global Utilities for API Calls with Exponential Backoff ---
const MAX_RETRIES = 3;
const initialDelay = 1000; // 1 second

/**
 * Executes a fetch request with exponential backoff for resilience.
 * @param {string} url - The API endpoint URL.
 * @param {object} options - Fetch options (method, headers, body, etc.).
 * @returns {Promise<object>} The JSON response data.
 * @throws {Error} If the request fails after all retries.
 */
const safeFetch = async (url, options) => {
    let delay = initialDelay;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await fetch(url, options);

            if (response.ok) {
                return await response.json();
            }

            // Try to read the JSON error body
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: `HTTP Error: ${response.status} ${response.statusText}` };
            }

            if (i === MAX_RETRIES - 1) {
                throw new Error(errorData.message || 'La solicitud falló después de varios reintentos.');
            }

        } catch (error) {
            // If it's a network error, log and retry
            if (i === MAX_RETRIES - 1) {
                throw new Error(error.message || 'Error de red desconocido.');
            }
        }
        
        // Exponential backoff wait
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
    }
    // Fallback error, should be unreachable
    throw new Error('La solicitud no se pudo completar.');
};
// ----------------------------------------------------


// ----------------------------------------------------
// Component 0: Custom Alert & Confirmation Modals
// ----------------------------------------------------

/**
 * Global state for displaying temporary success/error messages.
 */
const ToastAlert = ({ show, type, title, text, onClose }) => {
    const [isVisible, setIsVisible] = useState(show);

    useEffect(() => {
        setIsVisible(show);
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Auto-hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!isVisible && !show) return null;

    let bgColor = '';
    let icon = '';

    switch (type) {
        case 'success':
            bgColor = 'bg-green-600';
            icon = '✓';
            break;
        case 'error':
            bgColor = 'bg-red-600';
            icon = '✕';
            break;
        case 'warning':
        default:
            bgColor = 'bg-yellow-500';
            icon = '!';
            break;
    }


    return (
        <div 
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-2xl transition-all duration-300 ease-in-out transform ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${bgColor} text-white max-w-sm`}
            role="alert"
        >
            <div className="flex items-start">
                <span className="text-xl mr-2 font-bold">{icon}</span>
                <div>
                    <h5 className="font-bold text-lg">{title}</h5>
                    <p className="text-sm">{text}</p>
                </div>
                <button 
                    onClick={onClose} 
                    className="ml-auto -mt-1 text-white/80 hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

/**
 * Confirmation Modal for deletion actions.
 */
const ConfirmationModal = ({ show, title, message, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full transform transition-all duration-300 scale-100 border-t-4 border-red-500">
                <h3 className="text-2xl font-bold text-red-600 mb-4">{title}</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 shadow-md"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150 shadow-lg"
                    >
                        Sí, eliminar!
                    </button>
                </div>
            </div>
        </div>
    );
};


// ----------------------------------------------------
// Component 1: LinkProviderForm
// Handles the creation/linking of a new provider profile to an existing user.
// ----------------------------------------------------
const LinkProviderForm = ({ onBack, onProviderLinked, onShowToast }) => {
    const [potentialUsers, setPotentialUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPotentialUsers = useCallback(async () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            onShowToast('error', 'Error', 'Token de autenticación no encontrado.');
            setLoading(false);
            return;
        }

        try {
            // Using safeFetch to replace axios.get with backoff logic
            const response = await safeFetch('/api/providers/potential', {
                headers: { 
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json' 
                }
            });

            if (response.success) {
                setPotentialUsers(response.data);
                if (response.data.length > 0) {
                    // Pre-select the first user
                    setSelectedUserId(response.data[0].usersId.toString()); 
                }
            } else {
                setError(response.message || 'Error al cargar usuarios potenciales.');
            }
        } catch (err) {
            setError(err.message || 'Error de red al cargar usuarios.');
        } finally {
            setLoading(false);
        }
    }, [onShowToast]);

    useEffect(() => {
        fetchPotentialUsers();
    }, [fetchPotentialUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUserId || !specialty) {
            onShowToast('warning', 'Atención', 'Debe seleccionar un usuario y especificar una especialidad.');
            return;
        }

        const token = localStorage.getItem('userToken');
        if (!token) {
            onShowToast('error', 'Error', 'Token no encontrado.');
            return;
        }

        try {
            const payload = {
                usersId: parseInt(selectedUserId),
                specialty: specialty.trim(),
            };

            // Using safeFetch to replace axios.post with backoff logic
            const response = await safeFetch('/api/providers/link', {
                method: 'POST',
                headers: { 
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.success) {
                onShowToast('success', 'Proveedor Vinculado', response.message);
                onProviderLinked(); // Go back to the table and refresh
            } else {
                onShowToast('error', 'Error', response.message || 'Error al vincular el proveedor.');
            }
        } catch (err) {
            const errMsg = err.message || 'Error al procesar la solicitud.';
            onShowToast('error', 'Error', errMsg);
        }
    };
    
    if (loading) return <div className="text-center mt-8 text-indigo-600 text-lg animate-pulse">Cargando usuarios potenciales...</div>;
    if (error) return <div className="text-center mt-8 text-red-600 p-4 border border-red-200 bg-red-50 rounded-lg max-w-md mx-auto">Error: {error}</div>;

    if (potentialUsers.length === 0) {
        return (
            <div className="text-center mt-10 p-6 bg-blue-100 rounded-xl max-w-xl mx-auto shadow-2xl">
                <p className="text-xl font-medium text-blue-800 mb-4">
                    No hay usuarios con el rol **'provider'** que aún no tengan una especialidad para vincular.
                </p>
                <p className="text-sm text-blue-700 mb-6">
                    (Todos los usuarios con rol 'provider' ya tienen un perfil de especialidad asociado).
                </p>
                <button 
                    onClick={onBack} 
                    className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    Volver a la Tabla
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-3xl border-t-4 border-indigo-500">
            <h2 className="text-3xl font-extrabold mb-6 text-indigo-700">Vincular Nuevo Perfil de Proveedor</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="userSelect" className="block text-sm font-semibold text-gray-700 mb-2">
                        Seleccionar Usuario (Rol: Provider sin especialidad vinculada)
                    </label>
                    <select
                        id="userSelect"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-black focus:ring-indigo-500 focus:border-indigo-500 shadow-inner appearance-none transition duration-200"
                        required
                    >
                        {potentialUsers.map(user => (
                            <option key={user.usersId} value={user.usersId}>
                                {user.name} {user.lastname} ({user.email}) - ID: {user.usersId}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="specialty" className="block text-sm font-semibold text-gray-700 mb-2">
                        Especialidad (Obligatorio)
                    </label>
                    <input
                        id="specialty"
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-inner transition duration-200"
                        placeholder="Ej: Pediatría, Medicina General, Fisioterapia"
                        required
                    />
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-100">
                    <button 
                        type="button" 
                        onClick={onBack} 
                        className="px-6 py-3 text-base font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition duration-150 shadow-md flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 text-base font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition duration-150 shadow-lg transform hover:scale-[1.02]"
                    >
                        Confirmar Vinculación
                    </button>
                </div>
            </form>
        </div>
    );
};


// ----------------------------------------------------
// Component 2: ProvidersTable (Updated with Delete Logic)
// ----------------------------------------------------
const ProvidersTable = ({ onViewChange, onShowToast }) => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, providerId: null, providerName: '' });

    const fetchProviders = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            setError('Token de autenticación no encontrado. Por favor, inicie sesión.');
            setLoading(false);
            return;
        }

        try {
            // Using safeFetch to replace axios.get with backoff logic
            const response = await safeFetch('/api/providers', {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json' 
                }
            });
            
            if (response.success) {
                setProviders(response.data);
            } else {
                setError(response.message || 'Error desconocido al cargar proveedores.');
            }
        } catch (err) {
            const errMsg = err.message || 'Error al cargar la lista de doctores.';
            setError(errMsg);
            onShowToast('error', 'Error de Acceso', errMsg);
        } finally {
            setLoading(false);
        }
    }, [onShowToast]);

    // Load providers on initial render
    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]); 

    // Function to initiate the deletion confirmation modal
    const confirmDelete = (providerId, providerName) => {
        setConfirmModal({
            show: true,
            providerId,
            providerName,
        });
    };

    // Function to handle the actual provider deletion
    const handleDeleteProvider = async () => {
        const { providerId, providerName } = confirmModal;
        setConfirmModal({ show: false, providerId: null, providerName: '' }); // Close modal

        const token = localStorage.getItem('userToken');
        if (!token) {
            onShowToast('error', 'Error', 'Token no encontrado.');
            return;
        }

        try {
            // Using safeFetch to replace axios.delete with backoff logic
            await safeFetch(`/api/providers/${providerId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `${token}` }
            });

            onShowToast('success', 'Eliminado!', `El perfil de proveedor de ${providerName} ha sido eliminado.`);

            // Update local state to reflect the deletion
            setProviders(prevProviders => prevProviders.filter(p => p.usersId !== providerId));

        } catch (err) {
            const errMsg = err.message || 'Error al eliminar el proveedor.';
            onShowToast('error', 'Error', errMsg);
        }
    };


    // Helper function to render the image component
    const renderProviderImage = (provider) => (
        <img 
            src={provider.image} 
            alt={`${provider.name} ${provider.lastname} profile`} 
            className="h-10 w-10 rounded-full object-cover shadow-md border-2 border-indigo-300"
            onError={(e) => {
                e.target.onerror = null; 
                // Placeholder image for broken URLs
                e.target.src = 'https://placehold.co/40x40/7C3AED/FFFFFF?text=P'; 
            }}
        />
    );

    if (loading) {
        return <div className="text-center mt-12 text-indigo-600 text-xl font-semibold animate-pulse">Cargando lista de doctores...</div>;
    }

    if (error) {
        return <div className="text-center mt-12 text-red-700 p-6 bg-red-100 rounded-xl max-w-lg mx-auto shadow-lg">
            <h4 className='font-bold mb-2'>Error al cargar datos</h4>
            <p>{error}</p>
        </div>;
    }
    
    // If providers list is empty after loading
    if (providers.length === 0) {
        return (
            <div className="text-center mt-10 p-8 bg-yellow-50 rounded-xl max-w-3xl mx-auto shadow-2xl border-t-4 border-yellow-400">
                <p className="text-xl font-medium text-yellow-800 mb-6">No se encontraron doctores registrados.</p>
                <button 
                    onClick={() => onViewChange('link')} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-300 transform hover:scale-105"
                >
                    Agregar el primer Doctor &rarr;
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-indigo-500">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Doctores Vinculados</h3>
                    <button 
                        onClick={() => onViewChange('link')} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-300 ease-in-out text-sm"
                    >
                        + Vincular Proveedor
                    </button>
                </div>
                
                {/* ---------------------------------------------------- */}
                {/* 1. DESKTOP VIEW */}
                {/* ---------------------------------------------------- */}
                <div className="hidden sm:block overflow-x-auto shadow-xl rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-100/70">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Especialidad</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Teléfono</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Foto</th> 
                                <th className="px-6 py-3 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {providers.map((provider) => (
                                <tr key={provider.usersId} className="hover:bg-indigo-50/50 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{provider.usersId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{provider.name} {provider.lastname}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">
                                        <span className='bg-indigo-100 px-3 py-1 rounded-full text-xs'>{provider.specialty}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{provider.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{provider.phone || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {renderProviderImage(provider)}
                                    </td>
                                    {/* Delete Button Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => confirmDelete(provider.usersId, `${provider.name} ${provider.lastname}`)}
                                            className="text-red-600 hover:text-red-800 font-semibold hover:scale-105 transition duration-150 p-2 rounded-lg bg-red-50 hover:bg-red-100"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ---------------------------------------------------- */}
                {/* 2. MOBILE VIEW */}
                {/* ---------------------------------------------------- */}
                <div className="sm:hidden space-y-4">
                    {providers.map((provider) => (
                        <div 
                            key={provider.usersId} 
                            className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 transition duration-300 hover:border-indigo-500"
                        >
                            <div className="flex justify-between items-start mb-3 border-b pb-3 border-gray-100">
                                {/* Left: Name and ID */}
                                <div className='flex items-center'>
                                    {renderProviderImage(provider)}
                                    <div className='ml-3'>
                                        <h5 className="text-lg font-bold text-indigo-700">
                                            {provider.name} {provider.lastname}
                                        </h5>
                                        <p className="text-xs text-gray-500">ID: {provider.usersId}</p>
                                    </div>
                                </div>
                                {/* Right: Delete Button */}
                                <div>
                                    <button
                                        onClick={() => confirmDelete(provider.usersId, `${provider.name} ${provider.lastname}`)}
                                        className="text-red-600 text-sm font-medium hover:text-red-800 transition duration-150 p-2 rounded-lg bg-red-50 hover:bg-red-100"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>

                            {/* Details Stacked */}
                            <div className="space-y-2 text-sm">
                                <p className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Especialidad:</span>
                                    <span className="text-indigo-600 font-semibold">{provider.specialty}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Email:</span>
                                    <span className="text-gray-800 truncate">{provider.email}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Teléfono:</span>
                                    <span className="text-gray-800">{provider.phone || 'N/A'}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                {/* End Mobile View */}

            </div>
            
            {/* Confirmation Modal */}
            <ConfirmationModal 
                show={confirmModal.show}
                title="Confirmar Eliminación de Proveedor"
                message={`¿Está seguro de que desea eliminar el perfil de proveedor de ${confirmModal.providerName}? Esta acción es permanente y desvincula la especialidad del usuario.`}
                onConfirm={handleDeleteProvider}
                onCancel={() => setConfirmModal({ show: false, providerId: null, providerName: '' })}
            />
        </div>
    );
};


// ----------------------------------------------------
// Component 3: Main App Component
// Handles the view switching and toast management.
// ----------------------------------------------------
const App = () => {
    // 'list' for the table, 'link' for the form
    const [view, setView] = useState('list');
    const [toast, setToast] = useState({ show: false, type: 'success', title: '', text: '' });

    const handleShowToast = (type, title, text) => {
        setToast({ show: true, type, title, text });
    };

    const handleHideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    const handleProviderLinked = () => {
        // Go back to list view and implicitly trigger a refresh in ProvidersTable via its useEffect dependencies
        setView('list');
    };

    const renderContent = () => {
        if (view === 'link') {
            return (
                <LinkProviderForm 
                    onBack={() => setView('list')} 
                    onProviderLinked={handleProviderLinked}
                    onShowToast={handleShowToast}
                />
            );
        }
        return (
            <ProvidersTable 
                onViewChange={setView} 
                onShowToast={handleShowToast}
            />
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans">
            <header className="bg-indigo-700 shadow-xl p-4 sm:p-6 rounded-xl mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    <span className='bg-white text-indigo-700 px-3 py-1 rounded-lg mr-2'>Admin</span>
                    Panel de Gestión de Proveedores
                </h1>
            </header>

            <main className="container mx-auto">
                {renderContent()}
            </main>

            <ToastAlert 
                show={toast.show}
                type={toast.type}
                title={toast.title}
                text={toast.text}
                onClose={handleHideToast}
            />
        </div>
    );
};

export default App;
