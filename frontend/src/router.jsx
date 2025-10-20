import { createBrowserRouter } from 'react-router-dom';
import Signin from './components/Signin';
import Logout from './components/Logout'; // Also shouldn't have Navbar
import Dashboard from './components/Dashboard';
import AdminRoute from './components/AdminRoute';
import Navbar from './layout/Navbar';
import Signup from './components/Signup';
import PatientsTable from './components/Patients/PatientsTable';
import ProvidersTable from './components/Doctors/ProvidersTable';
import AssignSpecialty from './components/Doctors/AssignSpecialty';

export const router = createBrowserRouter([
    // 1. PUBLIC ROUTES
    {
        path: '/',
        element: <Signin />
    },
    {
        path: '/signup',
        element: <Signup />
    },
    {
        path: '/logout',
        element: <Logout />
    },
    // 2. PROTECTED ROUTES
    {
        path: '/dashboard',
        element: (
        <AdminRoute>
            <Navbar />
            <Dashboard /> 
        </AdminRoute>
        )
    },
    // 3. Admin Routes
    {
        path: '/admin/patients',
        element: (
            <AdminRoute>
                <Navbar/>
                <PatientsTable/>
            </AdminRoute>
        )
    },
    {
        path: '/admin/providers',
        element: (
            <AdminRoute>
                <Navbar/>
                <ProvidersTable/>
            </AdminRoute>
        )
    },
    {
        path: '/admin/link-provider',
        element: (
            <AdminRoute>
                <AssignSpecialty/>
            </AdminRoute>
        )
    },
]);