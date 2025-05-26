import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const themes = ['dark_purple', 'dark_green', 'dark_cyan', 'dark_orange', 'dark_pink', 'dark_red'] as const;
type Theme = typeof themes[number];

const InterfaceThemes: React.FC = () => {
    const { t } = useTranslation();
    const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
        return (localStorage.getItem('theme') as Theme) || 'dark_purple';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);

        localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);

    const handleThemeChange = (theme: Theme) => {
        setCurrentTheme(theme);
    };

    return (
        <div className="themes_containers">
            {themes.map((theme) => (
                <div
                    key={theme}
                    id={theme}
                    className={`themes_box ${theme.replace('dark_', '')} re ${currentTheme === theme ? 'Active' : ''}`}
                    onClick={() => handleThemeChange(theme)}
                >
                    {t(theme.replace('dark_', ''))}
                </div>
            ))}
        </div>
    )
}

export default InterfaceThemes