import { configureStore } from '@reduxjs/toolkit';
import globalReducer from './globalSlice';
import encryptionReducer from './store/encryptionSlice';
import decryptionSlice from './store/decryptionSlice';
import encryptionMethodReducer from './store/encryptionMethodSlice';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
    reducer: {
        global: globalReducer,
        encryption: encryptionReducer,
        decryption: decryptionSlice,
        encryptionMethod: encryptionMethodReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;