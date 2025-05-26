import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Encryption from "@/Routes/Encryption";
import Decryption from "@/Routes/Decryption";
import Settings from "@/Routes/Settings";
import Titlebar from "@/Components/Titlebar";
import "@/main.css";
import Topbar from '@/Components/Topbar';
import Navbar from '@/Components/Navbar';
import RippleProvider from '@/Providers/RippleProvider';
import KeyProvider from '@/Providers/KeyProvider';
import '@/i18n';
import { ThemeProvider, initializeTheme } from '@Providers/ThemeProvider';
import { Provider } from 'react-redux';
import store from '@/store';
import UpdateModal from '@/Components/UpdateModal';

initializeTheme();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Provider store={store}>
            <RippleProvider>
                <ThemeProvider>
                    <HashRouter>
                        <UpdateModal />
                        <KeyProvider />
                        <Titlebar />
                        <Topbar />
                        <Routes>
                            <Route path="/" element={<Encryption />} />
                            <Route path="/Decryption" element={<Decryption />} />
                            <Route path="/Settings" element={<Settings />} />
                        </Routes>
                        <Navbar />
                    </HashRouter>
                </ThemeProvider>
            </RippleProvider>
        </Provider>
    </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
