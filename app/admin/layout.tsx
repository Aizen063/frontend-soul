'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Users, Music, Disc, List, Download, LayoutDashboard, Menu } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isAdmin, isInitialized, initAuth } = useAuthStore();
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

    const handleSidebarToggle = () => {
        if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
            setIsDesktopSidebarOpen((prev) => !prev);
            return;
        }
        setIsNavOpen((prev) => !prev);
    };

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (isInitialized) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!isAdmin) {
                router.push('/home');
            }
        }
    }, [isInitialized, isAuthenticated, isAdmin, router]);

    if (!isInitialized) {
        return null;
    }

    if (!isAuthenticated || !isAdmin) {
        return null;
    }

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
        { icon: Users, label: 'Users', href: '/admin/users' },
        { icon: Music, label: 'Songs', href: '/admin/songs' },
        { icon: Disc, label: 'Artists', href: '/admin/artists' },
        { icon: List, label: 'Playlists', href: '/admin/playlists' },
        { icon: Download, label: 'Import', href: '/admin/import' },
    ];

    return (
        <div className="h-[100dvh] flex text-white overflow-hidden relative" style={{ background: 'transparent' }}>
            {isNavOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    aria-label="Close admin navigation"
                    onClick={() => setIsNavOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 w-72 md:w-64 flex flex-col h-[100dvh] z-50 overflow-hidden transition-transform duration-300 motion-sidebar-enter ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} ${isDesktopSidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}`}
                style={{
                    background: '#0b0b0b',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <div className="p-6 md:p-8 relative z-10">
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.04em', margin: 0 }}>
                        <span style={{ color: 'var(--neon-green)' }}>ADMIN</span>
                        <span style={{ color: '#fff', marginLeft: '6px' }}>PANEL</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 relative z-10 overflow-y-auto pb-6">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsNavOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 transition-all duration-300 group relative overflow-hidden motion-btn rounded-xl"
                                style={{
                                    background: isActive ? 'rgba(29, 185, 84, 0.16)' : 'transparent',
                                    border: isActive ? '1px solid rgba(29, 185, 84, 0.45)' : '1px solid transparent',
                                    color: isActive ? '#fff' : 'var(--text-secondary)',
                                    borderRadius: '12px',
                                }}
                            >
                                <Icon size={20} className="relative z-10 transition-all duration-300 group-hover:scale-110" />
                                <span className="relative z-10" style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: isActive ? 700 : 400 }}>
                                    {item.label}
                                </span>
                                {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-neon-green" />}
                            </Link>
                        );
                    })}

                    <Link
                        href="/home"
                        onClick={() => setIsNavOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 mt-6 pt-6 transition-all duration-300 motion-btn rounded-xl"
                        style={{
                            color: 'var(--neon-green)',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>BACK TO APP</span>
                    </Link>
                </nav>
            </aside>

            <div className={`flex-1 flex flex-col overflow-hidden relative z-10 transition-[padding] duration-300 ${isDesktopSidebarOpen ? 'md:pl-64' : 'md:pl-0'}`}>
                <header
                    className="h-16 md:h-20 flex items-center justify-between px-4 sm:px-5 md:px-8 sticky top-0 z-40"
                    style={{
                        background: 'rgba(10, 10, 10, 0.92)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            aria-label="Open admin navigation"
                            onClick={handleSidebarToggle}
                            className="p-2 motion-btn"
                            style={{ color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                            <Menu size={20} />
                        </button>
                        <h2
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: 'clamp(0.85rem, 2.2vw, 1.2rem)',
                                color: 'var(--text-primary)',
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                margin: 0,
                            }}
                        >
                            Admin Dashboard
                        </h2>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-8 md:pb-10" style={{ background: 'transparent' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
