import {configureStore} from "@reduxjs/toolkit";
import {termReducer} from "@/reporting/data/termSlice";
import {combineReducers} from "redux";
import {instructorReducer} from "@/reporting/data/instructorsSlice";
import {courseReducer} from "@/reporting/data/coursesSlice";
import { enrollmentsReducer } from "./enrollmentsSlice";
import {accountsReducer} from "@/reporting/data/accountsSlice";
import {persistReducer, persistStore} from "redux-persist";
import storage from 'redux-persist/lib/storage';

const reducer = combineReducers({
    terms: termReducer,
    instructors: instructorReducer,
    courses: courseReducer,
    enrollments: enrollmentsReducer,
    accounts: accountsReducer,
});

const persistConfig = {
    key: "reportingStore",
    storage,
    whitelist: ["terms", "instructors", "courses", "enrollments", "accounts"], // Choose what to persist
};

const persistedReducer = persistReducer(persistConfig, reducer);

export const reportingStore = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Prevents warnings about non-serializable data
        }),
});

export const persistor = persistStore(reportingStore);

export type RootReportingState = ReturnType<typeof reducer>;
export type AppDispatch = typeof reportingStore.dispatch;
export type RootState = ReturnType<typeof reportingStore.getState>;