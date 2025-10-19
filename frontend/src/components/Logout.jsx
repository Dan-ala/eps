// src/components/Logout.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Remove all authentication-related items from local storage
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        // If you stored the name or any other session data:
        // localStorage.removeItem('userName'); 

        // 2. Display a confirmation message
        Swal.fire({
            icon: 'success',
            title: 'Sesión Cerrada',
            text: 'Has cerrado tu sesión con éxito.',
            showConfirmButton: false,
            timer: 1500 // Automatically close after 1.5 seconds
        }).then(() => {
            // 3. Redirect the user to the sign-in page
            navigate('/', { replace: true });
        });
        
        // Note: The empty dependency array ensures this runs only once when mounted.
    }, [navigate]);

    // Render a simple message while the cleanup and redirect occur
    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-xl">Cerrando sesión...</p>
        </div>
    );
};

export default Logout;