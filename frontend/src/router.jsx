import { createBrowserRouter } from 'react-router-dom';
import Signin from './components/Signin';
import Logout from './components/Logout'; // Also shouldn't have Navbar
import Dashboard from './components/Dashboard';
import AdminRoute from './components/AdminRoute';
import Navbar from './layout/Navbar';
import Signup from './components/Signup';
import PatientsTable from './components/Patients/PatientsTable';
import ProvidersTable from './components/Doctors/ProvidersTable';
import AdminEditForm from './components/Admin/AdminEditForm';
import PatientEditForm from './components/Patients/PatientsEditForm';

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
        path: '/admin/edit/:usersId',
        element: (
        <AdminRoute>
            <Navbar/>
            <AdminEditForm />  {/* Use your new component here */}
        </AdminRoute>
        )
    },
    {
        path: '/admin/patients/link', 
        element: (
            <AdminRoute>
                <Navbar/>
                <PatientEditForm /> 
            </AdminRoute>
        )
    },
]);