import { create } from 'zustand';
import { User } from '@/types';
import api from '@/lib/api';
import { setAuthCookies, clearAuthCookies, getAuthCookie } from '@/lib/cookies';

const AUTH_LAST_VERIFIED_AT_KEY = 'auth:lastVerifiedAt';
const AUTH_SESSION_STARTED_AT_KEY = 'auth:sessionStartedAt';
// Session lasts 60 days — same as JWT expiry.
const AUTH_SESSION_TTL_MS = 60 * 24 * 60 * 60 * 1000;
// Only re-verify with the server once per week to reduce DB load.
const AUTH_VERIFY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// How long to wait for the background /me verification before giving up.
const AUTH_VERIFY_TIMEOUT_MS = 10_000;

const clearStoredAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem(AUTH_LAST_VERIFIED_AT_KEY);
    localStorage.removeItem(AUTH_SESSION_STARTED_AT_KEY);
    clearAuthCookies();
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
        // ── Persist to localStorage (session data) ────────────────────────────
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem(AUTH_SESSION_STARTED_AT_KEY, String(Date.now()));
        localStorage.setItem(AUTH_LAST_VERIFIED_AT_KEY, String(Date.now()));
        // ── Persist to cookie (survives tab/browser close) ────────────────────
        setAuthCookies(token, user.role ?? 'user');
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
        // ── Step 1: Resolve token — cookie first, localStorage fallback ────────
        // Cookies survive tab/browser closes. localStorage may be wiped by
        // aggressive SW or browser policies.
        const cookie = getAuthCookie();

        const token = cookie?.token ?? localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token) {
            set({ isInitialized: true });
            return;
        }

        // If cookie had the token but localStorage lost it, re-sync localStorage.
        if (cookie?.token && !localStorage.getItem('token')) {
            localStorage.setItem('token', cookie.token);
        }

        const now = Date.now();
        const fallbackStartAt = Number(localStorage.getItem(AUTH_LAST_VERIFIED_AT_KEY) || String(now));
        const sessionStartedAt = Number(localStorage.getItem(AUTH_SESSION_STARTED_AT_KEY) || String(fallbackStartAt));
        localStorage.setItem(AUTH_SESSION_STARTED_AT_KEY, String(sessionStartedAt));

        // Hard expiry — 60 days.
        if (now - sessionStartedAt > AUTH_SESSION_TTL_MS) {
            clearStoredAuth();
            set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isInitialized: true });
            return;
        }

        // ── Step 2: Parse cached user (if available) and show app immediately ──
        let parsedUser: User | null = null;
        if (userStr) {
            try {
                parsedUser = JSON.parse(userStr) as User;
            } catch {
                // Corrupted JSON — will be healed by the background /me call below.
            }
        }

        if (parsedUser) {
            // Fast path: we have everything we need — render immediately.
            set({
                user: parsedUser,
                token,
                isAuthenticated: true,
                isAdmin: parsedUser.role?.toLowerCase() === 'admin',
                isInitialized: true,
            });
        } else {
            // We have a token (from cookie) but no user data in localStorage.
            // Show a loading state while we fetch the user from the server.
            // This only happens when localStorage was partially cleared.
            set({ isAuthenticated: false, isInitialized: false });
        }

        // ── Step 3: Background verification (non-blocking) ────────────────────
        // Skipped if fresh (within 7 days), or if we need user data now.
        const lastVerifiedAt = Number(localStorage.getItem(AUTH_LAST_VERIFIED_AT_KEY) || '0');
        const needsFreshUser = !parsedUser;
        const verificationStale = now - lastVerifiedAt >= AUTH_VERIFY_TTL_MS;

        if (!needsFreshUser && !verificationStale) {
            return; // All good — no network call needed.
        }

        (async () => {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), AUTH_VERIFY_TIMEOUT_MS);

                const res = await api.get('/api/auth/me', { signal: controller.signal });
                clearTimeout(timer);

                const freshUser = res.data.data as User;
                localStorage.setItem('user', JSON.stringify(freshUser));
                localStorage.setItem('token', token);
                localStorage.setItem(AUTH_LAST_VERIFIED_AT_KEY, String(Date.now()));
                // Re-sync cookie with fresh role in case it was promoted/demoted.
                setAuthCookies(token, freshUser.role ?? 'user');
                set({
                    user: freshUser,
                    token,
                    isAuthenticated: true,
                    isAdmin: freshUser.role?.toLowerCase() === 'admin',
                    isInitialized: true,
                });
            } catch (err: unknown) {
                // ── CRITICAL: Only log out on an explicit 401 from the server.
                // Network errors, timeouts, 5xx → stay logged in.
                const status = (err as { response?: { status?: number } })?.response?.status;
                if (status === 401) {
                    clearStoredAuth();
                    set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isInitialized: true });
                } else if (needsFreshUser) {
                    // We needed user data but couldn't get it (offline/cold-start).
                    // Clear everything — we can't show the app without a user object.
                    clearStoredAuth();
                    set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isInitialized: true });
                }
            }
        })();
    },

    updateUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        // Keep cookie role in sync if role changes.
        const token = localStorage.getItem('token');
        if (token) setAuthCookies(token, user.role ?? 'user');
        set({ user });
    },
}));
