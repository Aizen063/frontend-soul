'use client';

import { Bell, LogOut, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
    onMenuToggle?: () => void;
    title?: string;
}

export default function Header({ onMenuToggle, title = 'Dashboard' }: HeaderProps) {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header
            className="h-16 md:h-20 flex items-center justify-between px-4 sm:px-5 md:px-8 sticky top-0 z-40"
            style={{
                background: 'rgba(10, 10, 10, 0.92)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'none',
            }}
        >
            <div className="flex-1 flex items-center gap-3">
                <button
                    type="button"
                    aria-label="Open navigation"
                    onClick={onMenuToggle}
                    className="p-2 motion-btn"
                    style={{ color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                    <Menu size={20} />
                </button>
                <h2
                    style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 'clamp(0.85rem, 2.2vw, 1.2rem)',
                        color: 'var(--text-primary)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        textShadow: 'none',
                        margin: 0,
                    }}
                >
                    {title}
                </h2>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                {/* Bell */}
                <button
                    className="relative p-2 transition-all duration-300 group motion-btn"
                    style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <Bell
                        size={22}
                        className="group-hover:[filter:drop-shadow(0_0_8px_rgba(29,185,84,0.8))]"
                        style={{ color: 'inherit' }}
                    />
                    <span
                        className="absolute top-1 right-2 w-2 h-2 rounded-full"
                        style={{
                            background: 'var(--neon-green)',
                            boxShadow: '0 0 8px rgba(29,185,84,0.7)',
                            animation: 'none',
                        }}
                    />
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 transition-all duration-300 group motion-btn rounded-xl"
                    style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        color: 'var(--text-secondary)',
                        background: 'transparent',
                        border: '1px solid var(--border-neon)',
                        cursor: 'pointer',
                        boxShadow: 'none',
                    }}
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">LOGOUT</span>
                </button>
            </div>
        </header>
    );
}
