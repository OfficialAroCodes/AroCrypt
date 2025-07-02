import React from 'react';
import { useTheme } from '@/Providers/ThemeProvider';

const themes = ['red', 'orange', 'green', 'blue', 'purple'] as const;
type Theme = typeof themes[number];

const ThemeSettings: React.FC = () => {
    const { themeBrand, setThemeBrand } = useTheme();

    const handleThemeChange = (theme: Theme) => {
        setThemeBrand(theme);
    };

    return (
        <div className="select_theme_boxes">
            {themes.map((theme) => (
                <span
                    key={theme}
                    id={theme}
                    className={`select_theme_box ${theme} re ${themeBrand === theme ? 'active' : ''}`}
                    onClick={() => handleThemeChange(theme)}
                />
            ))}
        </div>
    )
}

export default ThemeSettings