'use client';

import { Home, Library, Search, Settings, Mic2, Heart, Music, Disc3 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
    isMobileOpen?: boolean;
    isDesktopOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isMobileOpen = false, isDesktopOpen = true, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, isAdmin } = useAuthStore();

    const navItems = [
        { icon: Home, label: 'Home', href: '/home' },
        { icon: Music, label: 'Tracks', href: '/tracks' },
        { icon: Disc3, label: 'Albums', href: '/albums' },
        { icon: Search, label: 'Search', href: '/search' },
        { icon: Mic2, label: 'Artists', href: '/artists' },
        { icon: Heart, label: 'Liked Songs', href: '/liked' },
        { icon: Library, label: 'Library', href: '/library' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <div
            className={`fixed top-0 left-0 w-72 md:w-64 flex flex-col h-[100dvh] z-50 overflow-hidden transition-transform duration-300 motion-sidebar-enter ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isDesktopOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}`}
            style={{
                background: '#0b0b0b',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'none',
            }}
        >
            {/* Logo */}
            <div className="p-6 md:p-8 relative z-10">
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: '1.3rem', letterSpacing: '0.04em', margin: 0 }}>
                    <span style={{
                        color: 'var(--neon-green)',
                        textShadow: 'none',
                        animation: 'none',
                    }}>
                        SOUL
                    </span>
                    <span style={{
                        color: '#fff',
                        textShadow: 'none',
                        marginLeft: '6px'
                    }}>
                        SOUND
                    </span>
                </h1>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-2 relative z-10 overflow-y-auto pb-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-4 px-4 py-3 transition-all duration-300 group relative overflow-hidden motion-btn rounded-xl"
                            style={{
                                background: isActive
                                    ? 'rgba(29, 185, 84, 0.16)'
                                    : 'transparent',
                                border: isActive
                                    ? '1px solid rgba(29, 185, 84, 0.45)'
                                    : '1px solid transparent',
                                color: isActive ? '#fff' : 'var(--text-secondary)',
                                borderRadius: '12px',
                                transform: 'none',
                                boxShadow: 'none'
                            }}
                        >
                            <Icon
                                size={20}
                                className="relative z-10 transition-all duration-300 group-hover:scale-110"
                                style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(29,185,84,0.8))' } : {}}
                            />
                            <span
                                className="relative z-10"
                                style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: '0.95rem',
                                    fontWeight: isActive ? 700 : 400,
                                    letterSpacing: 'normal'
                                }}
                            >
                                {item.label}
                            </span>

                            {isActive && (
                                <div
                                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-neon-green"
                                />
                            )}
                        </Link>
                    );
                })}

                {isAdmin && (
                    <Link
                        href="/admin/dashboard"
                        onClick={onClose}
                        className="flex items-center gap-4 px-4 py-3 mt-6 pt-6 group transition-all duration-300 motion-btn rounded-xl"
                        style={{
                            color: 'var(--neon-green)',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                            textShadow: 'none',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.72rem'
                        }}
                    >
                        <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span style={{ fontWeight: 600 }}>ADMIN</span>
                    </Link>
                )}
            </nav>

            {/* User Card */}
            <div
                className="p-4 m-4 cursor-pointer transition-all duration-300 group relative z-10 rounded-2xl"
                style={{
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-neon)',
                    borderRadius: '16px',
                    boxShadow: 'none'
                }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 overflow-hidden shrink-0 rounded-full"
                        style={{ background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-pink))' }}
                    >
                        {user?.profilePic ? (
                            <img
                                src={user.profilePic}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-black">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate transition-colors duration-300 group-hover:text-[var(--neon-blue)]"
                            style={{ fontFamily: "var(--font-body)", color: 'var(--text-primary)' }}>
                            {user?.name || 'Guest User'}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>
                            {user?.email || 'Login to access'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
