// src/layout/Navbar.jsx

import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
// You might need to install 'react-icons' for the menu bar icon: npm install react-icons
import { FaBars, FaTimes } from 'react-icons/fa'; 

function Navbar() {
    // State to control the visibility of the mobile menu
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const isLoggedIn = localStorage.getItem('userToken'); 
    const userRole = localStorage.getItem('userRole'); 

    // Define main navigation links
    const mainLinks = [
        { name: 'Dashboard', path: '/dashboard', requiredRole: 'admin' }, // Only visible to admin
        { name: 'Pacientes', path: '/patients', requiredRole: 'all' },
        { name: 'Doctores', path: '/about', requiredRole: 'all' },
        // Add more static links here
    ];

    const authLinks = (
        <>
            {isLoggedIn ? (
                // LOGGED IN: Show Logout button and Role info
                <>
                    <span className="text-white text-sm bg-indigo-500 py-1 px-3 rounded-full hidden lg:inline">
                        Rol: {userRole}
                    </span>
                    <Link 
                        to="/logout" 
                        className="bg-white text-indigo-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-100 transition-colors border border-white"
                        onClick={() => setIsMenuOpen(false)} // Close menu on click
                    >
                        Cerrar Sesión
                    </Link>
                </>
            ) : (
                // LOGGED OUT: Show Signin link
                <Link 
                    to="/signin" 
                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                    Iniciar Sesión
                </Link>
            )}
        </>
    );

    // Filter links based on role (simple example)
    const filteredLinks = mainLinks.filter(link => {
        if (link.requiredRole === 'all') return true;
        return link.requiredRole === userRole;
    });

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
                    {filteredLinks.map(link => (
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


                {/* 3. Mobile Menu Button (Visible on small screens) */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-white text-2xl lg:hidden z-30 focus:outline-none"
                >
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* 4. Mobile Menu Sidebar (Appears from the right, mimicking your CSS) */}
            <div 
                className={`fixed top-0 right-0 h-full w-64 bg-gray-800 p-6 shadow-2xl transition-transform duration-300 transform z-20 lg:hidden 
                    ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`
                }
            >
                <div className="flex flex-col space-y-4 pt-16">
                    {/* Render main links in the mobile menu */}
                    {filteredLinks.map(link => (
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
            
            {/* Overlay to close the menu when clicking outside */}
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