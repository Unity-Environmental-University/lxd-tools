import {configureStore} from "@reduxjs/toolkit";
import {termReducer} from "@/reporting/data/termSlice";
import {combineReducers} from "redux";
import {instructorReducer} from "@/reporting/data/instructorsSlice";
import {courseReducer} from "@/reporting/data/coursesSlice";
import { enrollmentsReducer } from "./enrollmentsSlice";
import {accountsReducer} from "@/reporting/data/accountsSlice";
import {createMigrate, createTransform, MigrationManifest, PersistConfig, persistReducer, persistStore} from "redux-persist";
import storage from 'redux-persist/lib/storage';

const reducer = combineReducers({
    terms: termReducer,
    instructors: instructorReducer,
    courses: courseReducer,
    enrollments: enrollmentsReducer,
    accounts: accountsReducer,
});

type ReportingState = ReturnType<typeof reducer>;

/**
 * Only non-user data is persisted. Course rosters, enrollments and course data (which embeds
 * teacher lists) are user data that goes stale, so they are fetched fresh each session.
 */
export const PERSISTED_KEYS = ["terms", "accounts"] as const satisfies readonly (keyof ReportingState)[];

/**
 * Earlier versions persisted every slice. Drop anything that is no longer persisted so stale
 * rosters and in-flight loading flags are not rehydrated; the next write then removes them
 * from storage.
 */
export const reportingMigrations: MigrationManifest = {
    1: (state) => {
        if (!state) return state;
        const persisted = state as Record<string, unknown>;
        const migrated: Record<string, unknown> = {_persist: persisted._persist};
        for (const key of PERSISTED_KEYS) {
            if (key in persisted) migrated[key] = persisted[key];
        }
        return migrated as typeof state;
    },
};

const initialState = reducer(undefined, {type: "@@reporting/INIT"});

/**
 * A slice that was saved mid-load (e.g. the tab closed while terms were loading) would otherwise
 * rehydrate as permanently 'loading' or partially filled. Start those slices over instead.
 */
const discardIncompleteLoads = createTransform<any, any>(
    (inboundState) => inboundState,
    (outboundState, key) => {
        if (outboundState?.status === "fulfilled") return outboundState;
        return initialState[key as keyof ReportingState];
    },
    {whitelist: [...PERSISTED_KEYS]},
);

export const persistConfig: PersistConfig<ReportingState> = {
    key: "reportingStore",
    version: 1,
    storage,
    whitelist: [...PERSISTED_KEYS],
    transforms: [discardIncompleteLoads],
    migrate: createMigrate(reportingMigrations, {debug: false}),
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
