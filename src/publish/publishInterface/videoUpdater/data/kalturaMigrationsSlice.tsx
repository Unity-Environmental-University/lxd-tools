import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {KalturaMigrationDetails, KalturaMigrationsState} from "@publish/publishInterface/videoUpdater/data/types";
import {beginMigration} from "@publish/publishInterface/videoUpdater/data/actions/beginMigration";

// Define the initial state for migrations
const initialState: KalturaMigrationsState = {
    error: undefined,
    courseId: undefined,
    migrations: {},
    status: 'idle',
};



// Create a slice for Kaltura migrations
export const kalturaMigrationsSlice = createSlice({
    name: 'kaltura',
    initialState,
    extraReducers: (builder) => builder


        .addCase(beginMigration.pending, (state, action) => {

        })
        .addCase(beginMigration.fulfilled, (state, action) => {

        })
    ,
    reducers: {
        migrationSucceeded(state, action: PayloadAction<KalturaMigrationDetails>) {
            state.migrations[action.payload.id] = action.payload; // Store by ID
        },
        migrationFailed(state, action: PayloadAction<{ id: string; error: string }>) {
            const migration = state.migrations[action.payload.id];
            if (migration) {
                migration.status = 'failed';
                migration.error = action.payload.error;
            }
        },
        updateMigration(state, action: PayloadAction<KalturaMigrationDetails>) {
            state.migrations[action.payload.id] = action.payload; // Overwrite existing migration
        },
        setMigrationStatus(state, action: PayloadAction<KalturaMigrationsState['status']>) {
            state.status = action.payload;
        },
        resetMigrationStatus(state, action: PayloadAction<string>) {
            const migration = state.migrations[action.payload];
            if (migration) {
                migration.status = 'pending';
                migration.error = undefined;
            }
        },
        addMigration(state, action: PayloadAction<KalturaMigrationDetails>) {
            const {id, status} = action.payload;
            // Check if migration already exists or is not in an idle state
            if (!state.migrations[id] && status === 'pending') {
                state.migrations[id] = action.payload; // Store by ID
            }
        },
        loadMigrationsFromLocalStorage(state, action: PayloadAction<number>) {
            const courseId = action.payload;
            const savedMigrations = localStorage.getItem(`kalturaMigrations_${courseId}`);
            if (savedMigrations) {
                const parsedMigrations: KalturaMigrationsState = JSON.parse(savedMigrations);
                // Only update if the existing state is idle
                if (state.status === 'idle') {
                    state.migrations = parsedMigrations.migrations;
                    state.error = parsedMigrations.error;
                    state.status = parsedMigrations.status;
                }
            }
        },
        resetKalturaState(state, action: PayloadAction) {

        },
        saveMigrationsToLocalStorage(state, action: PayloadAction<number>) {
            const courseId = action.payload;
            const migrationsToSave = {
                migrations: state.migrations,
                error: state.error,
                status: state.status,
            };
            localStorage.setItem(`kalturaMigrations_${courseId}`, JSON.stringify(migrationsToSave));
        },
    },
});


type PartialRootState = {
    kaltura: KalturaMigrationsState
}

// Base selector for accessing the courseAssignments slice
const selectKalturaState = (state: PartialRootState) => state.kaltura;

export const selectKalturaStatus = createSelector(
    selectKalturaState,
    (state ) => {
        return {
            status: state.status,
            error: state.error,
            migrations: state.migrations
        };
    }
)

// Export actions and reducer
export const {
    migrationSucceeded,
    migrationFailed,
    resetKalturaState,
    addMigration,
    updateMigration,
    // setMigrationStatus,
    // resetMigrationStatus,
    // abortMigration,
    loadMigrationsFromLocalStorage,
    saveMigrationsToLocalStorage
} = kalturaMigrationsSlice.actions;

export const kalturaMigrationsReducer = kalturaMigrationsSlice.reducer;
