import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EncryptionState {
    encryptText: string;
    outputText: string;
    ivText: string;
}

const initialState: EncryptionState = {
    encryptText: '',
    outputText: '',
    ivText: ''
};

const encryptionSlice = createSlice({
    name: 'encryption',
    initialState,
    reducers: {
        setOutputText: (state, action: PayloadAction<string>) => {
            state.outputText = action.payload;
        },
        setIvText: (state, action: PayloadAction<string>) => {
            state.ivText = action.payload;
        },
        setEncryptText: (state, action: PayloadAction<string>) => {
            state.encryptText = action.payload;
        }
    }
});

export const { setOutputText, setIvText, setEncryptText } = encryptionSlice.actions;
export default encryptionSlice.reducer;