'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Player from '@/components/layout/Player';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, isInitialized, initAuth } = useAuthStore();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

    const handleSidebarToggle = () => {
        if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
            setIsDesktopSidebarOpen((prev) => !prev);
            return;
        }
        setIsMobileSidebarOpen((prev) => !prev);
    };

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            router.push('/login');
        }
    }, [isInitialized, isAuthenticated, router]);

    if (!isInitialized) {
        return null; // Or a loading spinner
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="h-[100dvh] flex text-white overflow-hidden relative" style={{ background: 'transparent' }}>
            <Sidebar
                isMobileOpen={isMobileSidebarOpen}
                isDesktopOpen={isDesktopSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
            />
            {isMobileSidebarOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}
            <div className={`flex-1 flex flex-col overflow-hidden relative z-10 transition-[padding] duration-300 ${isDesktopSidebarOpen ? 'md:pl-64' : 'md:pl-0'}`}>
                <Header onMenuToggle={handleSidebarToggle} />
                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-28 md:pb-32" style={{ background: 'transparent' }}>
                    {children}
                </main>
                <Player />
            </div>
        </div>
    );
}
