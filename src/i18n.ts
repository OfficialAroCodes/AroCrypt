import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './Locales/en.json';
import ruTranslations from './Locales/ru.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslations },
            ru: { translation: ruTranslations }
        },
        lng: localStorage.getItem('language') || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;