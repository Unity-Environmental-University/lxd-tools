import {configureStore} from "@reduxjs/toolkit";
import rootReducer from "@citations/state/rootReducer";

export const store = configureStore({
    reducer: rootReducer,
})
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type KalturaAppDispatch = typeof store.dispatch