// src/layout/Navbar.jsx

import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa'; 

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // FIX: Use localStorage.getItem() directly
    const isLoggedIn = localStorage.getItem('userToken'); 
    const userRole = localStorage.getItem('userRole'); 
    
    // Check user roles
    const isAdmin = userRole === 'admin'; 
    const isProvider = userRole === 'provider';
    const isPatient = userRole === 'patient'; 

    // --- Dynamic Links ---
    
    const adminLinks = [
        { name: 'Pacientes', path: '/admin/patients' },
        { name: 'Doctores', path: '/admin/providers' },
    ];

    const providerLinks = [
        { name: 'Mis Citas', path: '/provider/appointments' },
        { name: 'Mi Horario', path: '/provider/schedule' },
    ];

    const patientLinks = [
        { name: 'Solicitar Cita', path: '/patient/request-appointment' },
        { name: 'Mis Registros', path: '/patient/records' },
    ];

    const commonLinks = [
        { name: 'Dashboard', path: '/dashboard' },
    ];
    
    // Combine all relevant links based on role
    const links = [...commonLinks];
    
    if (isAdmin) {
        links.push(...adminLinks);
    } else if (isProvider) {
        links.push(...providerLinks);
    } else if (isPatient) {
        links.push(...patientLinks);
    }

    const authLinks = (
        <>
            {isLoggedIn ? (
                <>
                    <span className="text-white text-sm bg-indigo-500 py-1 px-3 rounded-full hidden lg:inline">
                        Rol: {userRole}
                    </span>
                    <Link 
                        to="/logout" 
                        className="bg-white text-indigo-700 font-semibold py-1 px-3 rounded-md hover:bg-gray-100 transition-colors border border-white"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Cerrar Sesión
                    </Link>
                </>
            ) : (
                <Link 
                    to="/" 
                    className="bg-green-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                >
                    Iniciar Sesión
                </Link>
            )}
        </>
    );

    return (
        <nav className="bg-indigo-700 p-4 shadow-xl relative z-20">
            
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                {/* 1. Logo/Brand Link (Left Side) */}
                <Link 
                    to={isLoggedIn ? `/dashboard` : "/"} 
                    className="text-white text-2xl font-extrabold tracking-wider hover:text-indigo-200 transition-colors z-30"
                >
                    EPS System
                </Link>

                {/* 2. Desktop Navigation (Hidden on small screens) */}
                <div className="hidden lg:flex items-center space-x-6">
                    {/* Render Links */}
                    {isLoggedIn && links.map(link => (
                        <NavLink 
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => 
                                `text-gray-200 hover:text-white transition-colors py-1 px-3 rounded ${isActive ? 'bg-indigo-600 text-white' : ''}`
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                    {authLinks}
                </div>

                {/* 3. Mobile Menu Button */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-white text-2xl lg:hidden z-30 focus:outline-none"
                >
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* 4. Mobile Menu Sidebar */}
            <div 
                className={`fixed top-0 right-0 h-full w-64 bg-gray-800 p-6 shadow-2xl transition-transform duration-300 transform z-20 lg:hidden 
                    ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`
                }
            >
                <div className="flex flex-col space-y-4 pt-16">
                    {/* Render ALL Links in the mobile menu */}
                    {isLoggedIn && links.map(link => (
                        <NavLink 
                            key={link.name}
                            to={link.path}
                            className="text-gray-200 hover:text-white text-lg transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                    <div className="pt-4 border-t border-gray-700">
                        {authLinks}
                    </div>
                </div>
            </div>
            
            {/* Overlay */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}
        </nav>
    );
}

export default Navbar;