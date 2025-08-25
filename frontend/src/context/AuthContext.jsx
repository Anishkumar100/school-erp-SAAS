/* eslint-disable react/prop-types */
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false)
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true); // Start with true
    const [themeDark, setThemeDark] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem("user");
        const theme = localStorage.getItem("themeDark");

        if (theme) {
            setThemeDark(JSON.parse(theme));
        }
        
        if (token && userData) {
            setAuthenticated(true);
            setUser(JSON.parse(userData));
        }
        
        setLoading(false); // Set loading to false after checking
    }, []);

    // Login function - CORRECTED
    const login = (data) => {
        // ASSUMING 'data' is the object from your backend, 
        // containing 'token' and 'user' properties.
        
        // 1. Save session data to localStorage FIRST
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); // <-- Important: Stringify objects

        // 2. Then, update the state
        setAuthenticated(true);
        setUser(data.user);
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setAuthenticated(false);
    };

    const themeChange = () => {
        localStorage.setItem("themeDark", `${!themeDark}`);
        setThemeDark(!themeDark);
    }

    return (
        <AuthContext.Provider value={{ authenticated, user, login, logout, loading, themeChange, themeDark }}>
            {children}
        </AuthContext.Provider>
    );
};