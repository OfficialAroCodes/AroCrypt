import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DecryptionState {
    decryption_key: string;
    security_key: string;
    decrypted_text: string;
}

const initialState: DecryptionState = {
    decryption_key: '',
    security_key: '',
    decrypted_text: ''
};

const decryptionSlice = createSlice({
    name: 'decryption',
    initialState,
    reducers: {
        setDecryptionKey: (state, action: PayloadAction<string>) => {
            state.decryption_key = action.payload;
        },
        setSecurityKeyS: (state, action: PayloadAction<string>) => {
            state.security_key = action.payload;
        },
        setDecryptedText: (state, action: PayloadAction<string>) => {
            state.decrypted_text = action.payload;
        }
    }
});

export const { setDecryptionKey, setSecurityKeyS, setDecryptedText } = decryptionSlice.actions;
export default decryptionSlice.reducer;