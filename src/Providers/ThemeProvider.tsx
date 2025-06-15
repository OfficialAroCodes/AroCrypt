import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from 'react';

export const themes = ['dark_orange', 'dark_red', 'dark_green', 'dark_blue', 'dark_purple'] as const;
export type Theme = typeof themes[number];

interface ThemeContextType {
    currentTheme: Theme;
    setCurrentTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    currentTheme: 'dark_orange',
    setCurrentTheme: () => { }
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
        return (localStorage.getItem('theme') as Theme) || 'dark_orange';
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
        document.documentElement.setAttribute('data-theme', 'dark_orange');
        localStorage.setItem('theme', 'dark_orange');
    }
};

initializeTheme();