import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from 'react';

const themeTypes = ['dark', 'light'] as const;
const themeBrands = ['orange', 'red', 'green', 'blue', 'purple'] as const;
export type ThemeType = typeof themeTypes[number];
export type ThemeBrand = typeof themeBrands[number];

interface ThemeContextType {
    themeType: ThemeType;
    setThemeType: (type: ThemeType) => void;
    themeBrand: ThemeBrand;
    setThemeBrand: (brand: ThemeBrand) => void;
    theme: string;
}

const defaultType: ThemeType = 'dark';
const defaultBrand: ThemeBrand = 'orange';

const ThemeContext = createContext<ThemeContextType>({
    themeType: defaultType,
    setThemeType: () => {},
    themeBrand: defaultBrand,
    setThemeBrand: () => {},
    theme: `${defaultType}_${defaultBrand}`,
});

export const useTheme = () => useContext(ThemeContext);

function parseThemeString(theme: string | null): [ThemeType, ThemeBrand] {
    if (!theme) return [defaultType, defaultBrand];
    const [type, brand] = theme.split('_');
    if (themeTypes.includes(type as ThemeType) && themeBrands.includes(brand as ThemeBrand)) {
        return [type as ThemeType, brand as ThemeBrand];
    }
    return [defaultType, defaultBrand];
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeType, setThemeType] = useState<ThemeType>(() => {
        const [type] = parseThemeString(localStorage.getItem('theme'));
        return type;
    });
    const [themeBrand, setThemeBrand] = useState<ThemeBrand>(() => {
        const [, brand] = parseThemeString(localStorage.getItem('theme'));
        return brand;
    });

    const theme = `${themeType}_${themeBrand}`;

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ themeType, setThemeType, themeBrand, setThemeBrand, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const initializeTheme = () => {
    const theme = localStorage.getItem('theme');
    const [type, brand] = parseThemeString(theme);
    document.documentElement.setAttribute('data-theme', `${type}_${brand}`);
    localStorage.setItem('theme', `${type}_${brand}`);
};

initializeTheme();