// src/components/Dashboard.jsx (Focus: Rendering based on the authorized role)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTable from './Admin/AdminTable';
import PatientsTable from './Patients/PatientsTable';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        
        if (role) {
            setUserRole(role);
            // Optionally fetch and set the userName here for a personalized greeting
        } 
        // Note: The else block (redirect logic) is primarily handled by AdminRoute now
    }, [navigate]);

    // --- Content Helper Components ---

    const AdminContent = () => (
        <>
        <h1 className="text-3xl font-bold mb-6">Dashboard Principal</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-600">Panel de Administración</h3>
            <p>Gestión de usuarios y accesos.</p>
            <AdminTable/>
        </div>
        </>
    );
    
    const ProviderContent = () => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-green-600">Panel de Proveedor (Doctor)</h3>
            <p>Gestión de citas, horarios y especialidad.</p>
            {/* You'd place forms/lists related to the provider's work here */}
        </div>
    );

    // --- Content Selector ---
    
    const renderContent = () => {
        switch (userRole) {
            case 'admin':
                return (
                <>
                    <AdminContent />
                </>
            );
            case 'provider':
                return <ProviderContent />;
            // Add other elevated roles (e.g., 'superadmin', 'manager') here
            default:
                // This will catch any roles that passed the AdminRoute but have no custom content defined
                return <p className="text-gray-500">Bienvenido, no hay contenido específico para su rol ({userRole}).</p>;
        }
    };

    if (!userRole) {
        return <div className="text-center mt-10">Cargando Dashboard...</div>;
    }

    return (
        <div className="p-8">
            {renderContent()}
        </div>
    );
};

export default Dashboard;