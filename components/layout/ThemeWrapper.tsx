'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const theme = useThemeStore((state) => state.theme);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            document.body.className = document.body.className
                .replace(/theme-\w+/g, '')
                .trim();
            document.body.classList.add(`theme-${theme}`);
        }
    }, [theme, mounted]);

    // Avoid flash of unstyled content by applying initial theme class if possible
    // or just render children normally and let useEffect handle it.
    return <>{children}</>;
}
