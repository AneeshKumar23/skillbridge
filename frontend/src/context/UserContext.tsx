import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser } from '../../api/db';

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface UserContextType {
    user: User | null;
    loginUser: (userId: string) => Promise<void>;
    logoutUser: () => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            fetchUser(storedUserId);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUser = async (userId: string) => {
        try {
            const userData = await getUser(userId);
            setUser(userData);
        } catch (error) {
            console.error('Failed to restore user session:', error);
            localStorage.removeItem('userId');
        } finally {
            setIsLoading(false);
        }
    };

    const loginUser = async (userId: string) => {
        setIsLoading(true);
        localStorage.setItem('userId', userId);
        await fetchUser(userId);
    };

    const logoutUser = () => {
        localStorage.removeItem('userId');
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, loginUser, logoutUser, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
