import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';

const themeTypes = ['dark', 'light'] as const;
export type ThemeType = typeof themeTypes[number];

interface ThemeContextType {
    themeType: ThemeType;
    setThemeType: (type: ThemeType) => void;
    theme: ThemeType;
    themeName: ThemeType;
}

const defaultType: ThemeType = 'light';

const ThemeContext = createContext<ThemeContextType>({
    themeType: defaultType,
    setThemeType: () => { },
    theme: defaultType,
    themeName: defaultType,
});

export const useTheme = () => useContext(ThemeContext);

function parseTheme(theme: string | null): ThemeType {
    if (themeTypes.includes(theme as ThemeType)) {
        return theme as ThemeType;
    }
    return getSystemPreferredTheme();
}

function getSystemPreferredTheme(): ThemeType {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeType, setThemeType] = useState<ThemeType>(() => {
        return parseTheme(localStorage.getItem('theme'));
    });

    const theme = themeType;
    const themeName = themeType;

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ themeType, setThemeType, theme, themeName }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const initializeTheme = () => {
    const theme = parseTheme(localStorage.getItem('theme'));
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
};

initializeTheme();