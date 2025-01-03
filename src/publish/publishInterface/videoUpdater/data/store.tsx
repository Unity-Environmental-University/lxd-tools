import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import {rootReducer} from "@publish/publishInterface/videoUpdater/data/rootReducer";


// Step 2: Configure the store
export const store = configureStore({
    reducer: rootReducer,
});


// Step 3: Infer RootState from the rootReducer
export type RootState = ReturnType<typeof rootReducer>;
export type RootStore = typeof store;
// Step 4: Type for AppDispatch
export type KalturaAppDispatch = typeof store.dispatch;

// Step 5: Define AppThunk type for thunks
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
