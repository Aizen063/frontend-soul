import { create } from 'zustand';
import { User } from '@/types';
import api from '@/lib/api';

const AUTH_LAST_VERIFIED_AT_KEY = 'auth:lastVerifiedAt';
const AUTH_VERIFY_TTL_MS = 30 * 60 * 1000;

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
        localStorage.setItem(AUTH_LAST_VERIFIED_AT_KEY, String(Date.now()));
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
        localStorage.removeItem(AUTH_LAST_VERIFIED_AT_KEY);
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
                const parsedUser = JSON.parse(userStr) as User;
                set({
                    user: parsedUser,
                    token,
                    isAuthenticated: true,
                    isAdmin: parsedUser.role?.toLowerCase() === 'admin',
                    isInitialized: true,
                });

                const lastVerifiedAt = Number(localStorage.getItem(AUTH_LAST_VERIFIED_AT_KEY) || '0');
                const isVerificationFresh = Date.now() - lastVerifiedAt < AUTH_VERIFY_TTL_MS;

                if (isVerificationFresh) {
                    return;
                }

                const res = await api.get('/api/auth/me');
                const user = res.data.data;
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem(AUTH_LAST_VERIFIED_AT_KEY, String(Date.now()));
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isAdmin: user.role?.toLowerCase() === 'admin',
                    isInitialized: true,
                });
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem(AUTH_LAST_VERIFIED_AT_KEY);
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
