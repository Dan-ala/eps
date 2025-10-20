import React, { useState } from "react";
import axios from 'axios';
import './Signin.css'
import { useNavigate } from 'react-router-dom';

const Signin = () => {
    const navigate = useNavigate();
    
    // State variables
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post('/api/users/login', {
                email,
                password
            });

            // 1. Correct Destructuring:
            const { 
                session_token,
                role,
                name,
            } = response.data.data;
            
            localStorage.setItem('userToken', session_token);
            localStorage.setItem('userRole', role); 
            
            setMessage(`Login exitoso! Bienvenido, ${name}. Rol: ${role}`);
            
            navigate(`/dashboard`); 

        } catch (error) {
            // Handle errors (e.g., 401 Unauthorized)
            const errorMessage = error.response?.data?.message || 'Error de conexión. Intente de nuevo.';
            setMessage(`Fallo en el Login: ${errorMessage}`);
            console.error('Login Error:', error.response || error);

        } finally {
            setLoading(false);
        }
    };

    const signup = () =>{
        navigate(`/signup`);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                        disabled={loading}
                    >
                        {loading ? 'Cargando...' : 'Entrar'}
                    </button>
                </form>
<br />
                <button
                onClick={signup}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                        disabled={loading}
                    >
                        Registrarse
                    </button>

                {message && (
                    <p className={`mt-4 text-center text-sm ${message.startsWith('Fallo') ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Signin;