import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EncryptionState {
    encryptText: string;
    output_PackedKeys: string;
}

const initialState: EncryptionState = {
    encryptText: '',
    output_PackedKeys: '',
};

const encryptionSlice = createSlice({
    name: 'encryption',
    initialState,
    reducers: {
        setOutputPackedKeys: (state, action: PayloadAction<string>) => {
            state.output_PackedKeys = action.payload;
        },
        setEncryptText: (state, action: PayloadAction<string>) => {
            state.encryptText = action.payload;
        }
    }
});

export const { setOutputPackedKeys, setEncryptText } = encryptionSlice.actions;
export default encryptionSlice.reducer;