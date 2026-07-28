import { createContext, useState, useEffect } from "react";
import api, { setUnauthorizedHandler } from "../services/api.js";

export const AuthContext = createContext(null);

// Component to provide authentication context to the application
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Function to verify the user's authentication status and its a -> closure <-
        const verifyUser = async () => {
            try {
                const res = await api.get("/auth/verify");

                console.log("User verified:", res.data.user);
                
                setUser(res.data.user);
            }
            catch (error) {
                setUser(null);
            }
            finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, []);

    // Set up the unauthorized handler to clear the user state when a 401 response is received
    useEffect(() => {
        setUnauthorizedHandler(() => {
            setUser(null);
        });
    }, []);

    const login = async (credentials) => {
        const res = await api.post("/auth/login", credentials);

        console.log("User logged in:", res.data.user);

        setUser(res.data.user);
        return res.data;
    };

    const register = async (userData) => {
        const res = await api.post("/auth/register", userData);
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        }
        finally {
            setUser(null);
        }
    };

    const value = {user, setUser, loading, isAuthenticated: !!user};

    return ( 
        <AuthContext.Provider value = {value}>
            {children}
        </AuthContext.Provider>
    );

};