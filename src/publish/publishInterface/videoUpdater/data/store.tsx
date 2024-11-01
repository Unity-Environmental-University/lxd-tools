import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import rootReducer from "@publish/publishInterface/videoUpdater/data/rootReducer";


// Step 2: Configure the store
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(),
});


// Step 3: Infer RootState from the rootReducer
export type RootState = ReturnType<typeof rootReducer>;

// Step 4: Type for AppDispatch
export type KalturaAppDispatch = typeof store.dispatch;

// Step 5: Define AppThunk type for thunks
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
export default store;