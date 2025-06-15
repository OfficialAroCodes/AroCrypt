import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DecryptionState {
    packedKeys: string;
    decrypted_text: string;
}

const initialState: DecryptionState = {
    packedKeys: '',
    decrypted_text: ''
};

const decryptionSlice = createSlice({
    name: 'decryption',
    initialState,
    reducers: {
        setPackedKeys: (state, action: PayloadAction<string>) => {
            state.packedKeys = action.payload;
        },
        setDecryptedText: (state, action: PayloadAction<string>) => {
            state.decrypted_text = action.payload;
        }
    }
});

export const { setPackedKeys, setDecryptedText } = decryptionSlice.actions;
export default decryptionSlice.reducer;