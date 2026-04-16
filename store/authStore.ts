import { create } from 'zustand';
import { User } from '@/types';
import api from '@/lib/api';

const AUTH_LAST_VERIFIED_AT_KEY = 'auth:lastVerifiedAt';
const AUTH_SESSION_STARTED_AT_KEY = 'auth:sessionStartedAt';
// Session lasts 60 days — same as JWT expiry.
const AUTH_SESSION_TTL_MS = 60 * 24 * 60 * 60 * 1000;
// Only re-verify with the server once per week to reduce DB load.
// Cold-start delays on Render won't affect this — see initAuth below.
const AUTH_VERIFY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// How long to wait for the background /me verification before giving up.
const AUTH_VERIFY_TIMEOUT_MS = 10_000;

const clearStoredAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem(AUTH_LAST_VERIFIED_AT_KEY);
    localStorage.removeItem(AUTH_SESSION_STARTED_AT_KEY);
};

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
        localStorage.setItem(AUTH_SESSION_STARTED_AT_KEY, String(Date.now()));
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
        clearStoredAuth();
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

        if (!token || !userStr) {
            set({ isInitialized: true });
            return;
        }

        // ── Step 1: Restore session from localStorage immediately ─────────────
        // The user sees the app right away — no waiting for a network call.
        const now = Date.now();
        const fallbackStartAt = Number(localStorage.getItem(AUTH_LAST_VERIFIED_AT_KEY) || String(now));
        const sessionStartedAt = Number(localStorage.getItem(AUTH_SESSION_STARTED_AT_KEY) || String(fallbackStartAt));
        localStorage.setItem(AUTH_SESSION_STARTED_AT_KEY, String(sessionStartedAt));

        // Absolute session expiry (60 days) — hard logout regardless of network.
        if (now - sessionStartedAt > AUTH_SESSION_TTL_MS) {
            clearStoredAuth();
            set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isInitialized: true });
            return;
        }

        let parsedUser: User;
        try {
            parsedUser = JSON.parse(userStr) as User;
        } catch {
            // Corrupted localStorage — clear and force login.
            clearStoredAuth();
            set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isInitialized: true });
            return;
        }

        // Show the app immediately with the cached user — no spinner, no re-login.
        set({
            user: parsedUser,
            token,
            isAuthenticated: true,
            isAdmin: parsedUser.role?.toLowerCase() === 'admin',
            isInitialized: true,
        });

        // ── Step 2: Background verification (non-blocking) ───────────────────
        // Only run once every 7 days to reduce DB load.
        const lastVerifiedAt = Number(localStorage.getItem(AUTH_LAST_VERIFIED_AT_KEY) || '0');
        if (now - lastVerifiedAt < AUTH_VERIFY_TTL_MS) {
            return; // Verification is still fresh — skip the network call.
        }

        // Run silently in the background — never block the UI on this.
        (async () => {
            try {
                // Timeout guard: if the server (e.g. Render cold-start) takes
                // longer than 10 s, abort — but keep the user logged in.
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), AUTH_VERIFY_TIMEOUT_MS);

                const res = await api.get('/api/auth/me', {
                    signal: controller.signal,
                });
                clearTimeout(timer);

                const freshUser = res.data.data as User;
                localStorage.setItem('user', JSON.stringify(freshUser));
                localStorage.setItem(AUTH_LAST_VERIFIED_AT_KEY, String(Date.now()));
                set({
                    user: freshUser,
                    isAdmin: freshUser.role?.toLowerCase() === 'admin',
                });
            } catch (err: unknown) {
                // ── CRITICAL: Only log out on an explicit 401 from the server.
                // Everything else (network offline, timeout, 5xx, Render cold-
                // start) should silently keep the current cached session alive.
                const status = (err as { response?: { status?: number } })?.response?.status;
                if (status === 401) {
                    clearStoredAuth();
                    set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
                }
                // All other errors: stay logged in. The verification will be
                // retried on the next app open.
            }
        })();
    },

    updateUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },
}));
