import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const themes = ['dark_red', 'dark_orange', 'dark_green', 'dark_blue', 'dark_purple'] as const;
type Theme = typeof themes[number];

const ThemeSettings: React.FC = () => {
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
        <div className="select_theme_boxes">
            {themes.map((theme) => (
                <span
                    key={theme}
                    id={theme}
                    className={`select_theme_box ${theme} re ${currentTheme === theme ? 'active' : ''}`}
                    onClick={() => handleThemeChange(theme)}
                />
            ))}
        </div>
    )
}

export default ThemeSettings