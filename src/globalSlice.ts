import { createSlice } from '@reduxjs/toolkit';
import i18n from './i18n';

const initialState = {
    language: localStorage.getItem('language') || 'en',
};

const globalSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        setLanguage: (state, action) => {
            const selectedLanguage = action.payload;
            state.language = selectedLanguage;
            localStorage.setItem('language', selectedLanguage);
            i18n.changeLanguage(selectedLanguage);
        }
    },
});

export const { setLanguage } = globalSlice.actions;
export default globalSlice.reducer;
