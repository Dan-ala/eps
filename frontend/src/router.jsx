import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import AdminRoute from './components/AdminRoute'

export const router = createBrowserRouter([
    {
        path:'/', element: <App />
    },
    {
        path:'/signup', element: <Signup />
    },
    {
        path:'/dashboard', 
        element: (
            <AdminRoute>
                <Dashboard />
            </AdminRoute>
        )
    }
])