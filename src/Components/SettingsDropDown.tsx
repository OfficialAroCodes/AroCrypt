import React, { ReactNode, useEffect, useRef } from "react";

type Props = {
    label: string;
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    dropdownRef?: React.RefObject<HTMLDivElement>;
    onToggle?: () => void;
    children: ReactNode;
};

const SettingsDropDown: React.FC<Props> = ({
    label,
    isOpen,
    setIsOpen,
    dropdownRef,
    onToggle,
    children
}) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
        if (onToggle) onToggle();
    };

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className="settings_dropdown_container" ref={containerRef}>
            <button
                className={`settings_dropdown_btn re`}
                onClick={handleClick}
            >
                {label}
                <svg
                    className={isOpen ? "rotate" : ""}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M6 9l6 6l6 -6" />
                </svg>
            </button>
            <div
                ref={dropdownRef}
                className={`settings_dropdown_box ${isOpen ? "show" : ""}`}
            >
                {children}
            </div>
        </div>
    );
};

export default SettingsDropDown;
