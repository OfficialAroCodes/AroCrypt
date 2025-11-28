import ToastNotification from "@/Components/ToastNotification";
import { createContext, useContext, useState, ReactNode } from "react";

type Toast = {
    id: number;
    type: number;
    message: string;
    title: string;
};

const ToastContext = createContext<(type: number, message: string, title: string) => void>(() => { });

let idCounter = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (type: number, message: string, title: string) => {
        const id = idCounter++;
        setToasts((prev) => [...prev, { id, type, message, title }]);
    };

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className="toast_notification_pos">
                {toasts.map(({ id, type, message, title }) => (
                    <ToastNotification
                        key={id}
                        type={type}
                        message={message}
                        title={title}
                        onDone={() => {
                            setToasts((prev) => prev.filter((t) => t.id !== id));
                        }}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
