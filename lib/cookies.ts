// ─── Cookie helpers for persistent auth ──────────────────────────────────────
// These cookies survive tab closes, browser restarts, and PWA launches.
// They act as a reliable fallback when Zustand's in-memory state is reset.

const COOKIE_TOKEN = 'ss_token';
const COOKIE_ROLE  = 'ss_role';
const COOKIE_TTL_DAYS = 60; // match JWT expiry

function buildCookieString(name: string, value: string, days: number): string {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    // SameSite=Lax: cookie is sent on top-level navigation, not cross-site sub-requests.
    // Secure: only sent over HTTPS (Vercel). Remove if testing on plain http localhost.
    return `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function setAuthCookies(token: string, role: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = buildCookieString(COOKIE_TOKEN, token, COOKIE_TTL_DAYS);
    document.cookie = buildCookieString(COOKIE_ROLE, role, COOKIE_TTL_DAYS);
}

export function clearAuthCookies(): void {
    if (typeof document === 'undefined') return;
    // Setting expires in the past deletes the cookie.
    document.cookie = `${COOKIE_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${COOKIE_ROLE}=;   expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function getAuthCookie(): { token: string; role: string } | null {
    if (typeof document === 'undefined') return null;

    const token = parseCookie(COOKIE_TOKEN);
    const role  = parseCookie(COOKIE_ROLE);

    if (!token || !role) return null;
    return { token, role };
}

function parseCookie(name: string): string | null {
    const match = document.cookie.match(
        new RegExp(`(?:^|; )${name}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : null;
}
