import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';

const NAV_CLOSED_CLASS = 'nav_closed';

interface NavContextType {
    isNavOpen: boolean;
    toggleNav: () => void;
    setNavOpen: (open: boolean) => void;
}

const NavContext = createContext<NavContextType | undefined>(undefined);

export const useNav = () => {
    const ctx = useContext(NavContext);
    if (!ctx) throw new Error('useNav must be used within a StartupProvider');
    return ctx;
};

const getInitialNavState = () => {
    const navStatus = localStorage.getItem('nav_status');
    return navStatus !== 'closed';
};

const StartupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isNavOpen, setIsNavOpen] = useState(getInitialNavState);

    useEffect(() => {
        if (!isNavOpen) {
            document.body.classList.add(NAV_CLOSED_CLASS);
            localStorage.setItem('nav_status', 'closed');
        } else {
            document.body.classList.remove(NAV_CLOSED_CLASS);
            localStorage.setItem('nav_status', 'opened');
        }
    }, [isNavOpen]);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'nav_status') {
                setIsNavOpen(e.newValue !== 'closed');
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const toggleNav = useCallback(() => setIsNavOpen(open => !open), []);
    const setNavOpen = useCallback((open: boolean) => setIsNavOpen(open), []);

    return (
        <NavContext.Provider value={{ isNavOpen, toggleNav, setNavOpen }}>
            {children}
        </NavContext.Provider>
    );
};

export default StartupProvider;
