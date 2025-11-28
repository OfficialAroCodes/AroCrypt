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

/* info: Utils */
import Algorithm from './Utils/AlgorithmUtil';

/* info: Providers */
import { ThemeProvider, initializeTheme } from '@Providers/ThemeProvider';
import RippleProvider from '@/Providers/RippleProvider';
import StartupProvider from './Providers/StartupProvider';
import { DecryptProvider } from '@/Context/DecryptContext';
import { EncryptProvider } from '@/Context/EncryptContext';
import { ToastProvider } from '@/Context/ToastContext';
import { KeysMainProvider } from '@/Context/KeysContext';
import { ExtractProvider } from '@/Context/ExtractContext';
import { EmbedProvider } from '@/Context/EmbedContext';

/* info: Routes */
import FileEncryption from '@/Routes/FileEncryption';
import TextEncryption from "@/Routes/TextEncryption";
import TextDecryption from "@/Routes/TextDecryption";
import FileDecryption from '@/Routes/FileDecryption';
import Settings from '@/Routes/Settings';
import AppearanceSettings from '@/Routes/tabs/Appearance';
import SettingsNav from '@/Routes/components/SettingsNav';
import DataHider from '@/Routes/DataHider';
import DataExtractor from '@/Routes/DataExtracter';


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
                    <ToastProvider>

                        <Provider store={store}>
                            <KeysMainProvider>
                                <RippleProvider>
                                    <ThemeProvider>
                                        <StartupProvider>
                                            <HashRouter>
                                                <UpdateModal />
                                                <Algorithm />
                                                <Titlebar isAbout={false} />
                                                <EncryptProvider>
                                                    <DecryptProvider>
                                                        <ExtractProvider>
                                                            <EmbedProvider>
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
                                                            </EmbedProvider>
                                                        </ExtractProvider>
                                                    </DecryptProvider>
                                                </EncryptProvider>
                                                <Navbar />
                                                <SettingsNav />
                                            </HashRouter>
                                        </StartupProvider>
                                    </ThemeProvider>
                                </RippleProvider>
                            </KeysMainProvider>
                        </Provider>
                    </ToastProvider>
                )}
    </React.StrictMode>,
)