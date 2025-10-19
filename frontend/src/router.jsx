import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import AdminRoute from './components/AdminRoute'
import Logout from './components/Logout';
import Navbar from './layout/Navbar';

export const router = createBrowserRouter([
    {
        path:'/', element: <App />
    },
    {
        path:'/signup', element: <Signup />
    },
    {
        path:'/logout', element: <Logout />
    },
    {
        path:'/dashboard', 
        element: (
            <AdminRoute>
                <Navbar />
                <Dashboard />
            </AdminRoute>
        )
    }
])