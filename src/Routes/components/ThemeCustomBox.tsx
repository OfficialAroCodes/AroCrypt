import { useTheme } from "@/Providers/ThemeProvider";

const ThemeCustomBox = ({ mode }: { mode: "dark" | "light" }) => {
    const { themeType, setThemeType } = useTheme();

    return (
        <div
            className={`theme_box re ${mode} ${themeType === mode ? 'active' : ''}`}
            onClick={() => setThemeType(mode)}
        >
            <span className='theme_titlebar'></span>
            <div className="content">
                <span className='sidebar' />
                <div className='page'>
                    <span className='box' />
                    <span className='text' />
                    <span className='text' />
                </div>
            </div>
        </div>
    )
}

export default ThemeCustomBox
