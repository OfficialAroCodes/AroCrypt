import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from 'react';

export const themes = ['dark_purple', 'dark_green', 'dark_cyan', 'dark_orange', 'dark_pink', 'dark_red'] as const;
export type Theme = typeof themes[number];

interface ThemeContextType {
    currentTheme: Theme;
    setCurrentTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    currentTheme: 'dark_purple',
    setCurrentTheme: () => { }
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
        return (localStorage.getItem('theme') as Theme) || 'dark_purple';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);

        localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && themes.includes(savedTheme)) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ currentTheme, setCurrentTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && themes.includes(savedTheme)) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        document.documentElement.setAttribute('data-theme', 'dark_purple');
        localStorage.setItem('theme', 'dark_purple');
    }
};

initializeTheme();