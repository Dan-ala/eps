import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminRoute = ({ children }) => {

    const ALLOWED_ROLES = ['admin', 'provider','patient'];
    
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    
    const isAuthorized = token && ALLOWED_ROLES.includes(role);

    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        if (!isAuthorized) {
            let title = 'Acceso Denegado';
            let message = '';
            
            if (!token) {
                message = 'Por favor, inicie sesión para acceder a esta ruta.';
            } else{
                message = `Su perfil '${role}', no tiene permisos de Administrador para ver el Dashboard.`;
            }

            // Fire the SweetAlert2 warning
            Swal.fire({
                icon: 'warning',
                title: title,
                text: message,
                confirmButtonText: 'Regresar'
            }).then(() => {
                setRedirect(true);
            });
        }
    }, [isAuthorized]); // Run only when component mounts or authorization status changes

    if (!isAuthorized && redirect) {
        return <Navigate to="/" replace />
    }

    if (isAuthorized) {
        return children;
    }
    
    return null; 
};

export default AdminRoute;