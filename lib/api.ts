import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { getAuthCookie } from '@/lib/cookies';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_URL = !configuredApiUrl || configuredApiUrl.includes('backend-soul.vercel.app')
    ? 'https://backend-soul.onrender.com'
    : configuredApiUrl;

const MEDIA_URL_KEYS = new Set(['coverImage', 'audioUrl', 'photo', 'profilePic']);

const normalizeMediaUrl = (url: string): string => {
    if (!url) return url;

    const localhostUploadsPrefix = 'http://localhost:5000/uploads/';
    const vercelUploadsPrefix = 'https://backend-soul.vercel.app/uploads/';

    if (url.startsWith(localhostUploadsPrefix) || url.startsWith(vercelUploadsPrefix)) {
        const uploadsPathIndex = url.indexOf('/uploads/');
        if (uploadsPathIndex !== -1) {
            return `${API_BASE_URL}${url.slice(uploadsPathIndex)}`;
        }
    }

    if (url.startsWith('/uploads/')) {
        return `${API_BASE_URL}${url}`;
    }

    return url;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const sanitizePayload = (value: unknown, parentKey?: string): unknown => {
    if (Array.isArray(value)) {
        return value
            .filter((item) => item !== null && item !== undefined)
            .map((item) => sanitizePayload(item, parentKey));
    }

    if (isPlainObject(value)) {
        const result: Record<string, unknown> = {};
        for (const [key, nestedValue] of Object.entries(value)) {
            result[key] = sanitizePayload(nestedValue, key);
        }
        return result;
    }

    if (typeof value === 'string') {
        if (parentKey && MEDIA_URL_KEYS.has(parentKey)) {
            return normalizeMediaUrl(value);
        }
        if (value.includes('localhost:5000/uploads/') || value.includes('backend-soul.vercel.app/uploads/')) {
            return normalizeMediaUrl(value);
        }
    }

    return value;
};

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        // Read from localStorage first (fast), fall back to cookie if cleared.
        const token = localStorage.getItem('token') ?? getAuthCookie()?.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        response.data = sanitizePayload(response.data);
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Don't intercept the /me verification call — authStore handles
            // that itself and decides whether to log out.
            const requestUrl: string = error.config?.url || '';
            if (requestUrl.includes('/api/auth/me')) {
                return Promise.reject(error);
            }

            // For every other 401 (e.g. expired token mid-session),
            // delegate to authStore so cleanup is consistent.
            useAuthStore.getState().logout();
            // Use replace so the back button doesn't return to the protected page.
            window.location.replace('/login');
        }
        return Promise.reject(error);
    }
);

export default api;
