import { create } from 'zustand';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isInitialized: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    initAuth: () => void;
    updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,

    isInitialized: false,

    login: (token: string, user: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({
            user,
            token,
            isAuthenticated: true,
            isAdmin: user.role?.toLowerCase() === 'admin',
            isInitialized: true,
        });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
            isInitialized: true,
        });
    },

    initAuth: async () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                // Verify token is still valid with the server
                const res = await api.get('/api/auth/me');
                const user = res.data.data;
                localStorage.setItem('user', JSON.stringify(user));
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isAdmin: user.role?.toLowerCase() === 'admin',
                    isInitialized: true,
                });
            } catch {
                // Token is invalid/expired — clear everything
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isInitialized: true });
            }
        } else {
            set({ isInitialized: true });
        }
    },

    updateUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },
}));
