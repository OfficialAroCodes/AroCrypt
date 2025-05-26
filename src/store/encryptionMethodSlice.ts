import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const DEFAULT_ENCRYPTION_METHOD = 'aes-256-cbc';

interface EncryptionMethodState {
    encryptionMethod: string;
    decryptionMethod: string;
}

const loadMethodFromStorage = (key: string) =>
    localStorage.getItem(key) || DEFAULT_ENCRYPTION_METHOD;

const initialState: EncryptionMethodState = {
    encryptionMethod: loadMethodFromStorage('encryptionMethod'),
    decryptionMethod: loadMethodFromStorage('decryptionMethod')
};

const encryptionMethodSlice = createSlice({
    name: 'encryptionMethod',
    initialState,
    reducers: {
        setEncryptionMethod: (state, action: PayloadAction<string>) => {
            state.encryptionMethod = action.payload;
            localStorage.setItem('encryptionMethod', action.payload);
        },
        setDecryptionMethod: (state, action: PayloadAction<string>) => {
            state.decryptionMethod = action.payload;
            localStorage.setItem('decryptionMethod', action.payload);
        }
    }
});

export const {
    setEncryptionMethod,
    setDecryptionMethod
} = encryptionMethodSlice.actions;

export default encryptionMethodSlice.reducer;