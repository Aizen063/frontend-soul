import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'neon' | 'retro' | 'galaxy' | 'glass';

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'neon',
            setTheme: (theme) => set({ theme }),
            toggleTheme: () =>
                set((state) => {
                    const themes: Theme[] = ['neon', 'retro', 'galaxy', 'glass'];
                    const currentIndex = themes.indexOf(state.theme);
                    const nextIndex = (currentIndex + 1) % themes.length;
                    return { theme: themes[nextIndex] };
                }),
        }),
        {
            name: 'soul-sound-theme',
        }
    )
);
