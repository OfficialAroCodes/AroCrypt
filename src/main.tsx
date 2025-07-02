import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/store';
import "@/main.css";
import '@/i18n';

/* info: Components */
import Titlebar from "@/Components/Titlebar";
import Navbar from '@/Components/Navbar';
import UpdateModal from '@/Components/UpdateModal';
import AboutWindow from '@/Components/AboutWindow';

/* info: Providers */
import { ThemeProvider, initializeTheme } from '@Providers/ThemeProvider';
import RippleProvider from '@/Providers/RippleProvider';
import KeyProvider from './Providers/KeyProvider';
import StartupProvider from './Providers/StartupProvider';

/* info: Routes */
import FileEncryption from '@/Routes/FileEncryption';
import TextEncryption from "@/Routes/TextEncryption";
import TextDecryption from "@/Routes/TextDecryption";
import FileDecryption from '@/Routes/FileDecryption';
import Settings from '@/Routes/Settings';
import AppearanceSettings from '@/Routes/tabs/Appearance';
import SettingsNav from './Routes/components/SettingsNav';
import DataHider from './Routes/DataHider';
import DataExtractor from './Routes/DataExtracter';
import Algorithm from './Utils/AlgorithmUtil';

initializeTheme();

const isAboutWindow = window.location.hash === '#about';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        {
            isAboutWindow ? (
                <>
                    <RippleProvider>
                        <Titlebar isAbout={true} />
                        <AboutWindow />
                    </RippleProvider>
                </>
            )
                : (
                    <Provider store={store}>
                        <RippleProvider>
                            <ThemeProvider>
                                <StartupProvider>
                                    <HashRouter>
                                        <UpdateModal />
                                        <KeyProvider />
                                        <Algorithm />
                                        <Titlebar isAbout={false} />
                                        <Routes>
                                            <Route path="/" element={<TextEncryption />} />
                                            {/* Encryption Routes */}
                                            <Route path="/encryption/text" element={<TextEncryption />} />
                                            <Route path="/encryption/file" element={<FileEncryption />} />

                                            {/* Decryption Routes */}
                                            <Route path="/decryption/text" element={<TextDecryption />} />
                                            <Route path="/decryption/file" element={<FileDecryption />} />

                                            {/* Steganography Routes */}
                                            <Route path="/steganography/hide" element={<DataHider />} />
                                            <Route path="/steganography/extract" element={<DataExtractor />} />

                                            {/* Settings Routes */}
                                            <Route path="/settings" element={<Settings />} />
                                            <Route path="/settings/appearance" element={<AppearanceSettings />} />
                                        </Routes>
                                        <Navbar />
                                        <SettingsNav />
                                    </HashRouter>
                                </StartupProvider>
                            </ThemeProvider>
                        </RippleProvider>
                    </Provider>
                )}
    </React.StrictMode>,
)