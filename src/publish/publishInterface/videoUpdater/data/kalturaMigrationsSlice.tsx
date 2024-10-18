import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KalturaMigrationDetails, KalturaMigrationsState } from "@publish/publishInterface/videoUpdater/data/types";
import { KalturaAppDispatch, RootState } from "@publish/publishInterface/videoUpdater/data/store";

// Define the initial state for migrations
const initialState: KalturaMigrationsState = {
    error: null,
    migrations: {},
    status: 'idle',
};

// Create a slice for Kaltura migrations
const kalturaMigrationsSlice = createSlice({
    name: 'kalturaMigrations',
    initialState,
    reducers: {
        migrationSucceeded(state, action: PayloadAction<KalturaMigrationDetails>) {
            state.migrations[action.payload.id] = action.payload; // Store by ID
        },
        migrationFailed(state, action: PayloadAction<{ id: string; error: string }>) {
            if (state.migrations[action.payload.id]) {
                state.migrations[action.payload.id].status = 'failed';
                state.migrations[action.payload.id].error = action.payload.error;
            }
        },
        resetKalturaState(state) {
            state.error = null;
            state.migrations = {};
        },
        addMigration(state, action: PayloadAction<KalturaMigrationDetails>) {
            state.migrations[action.payload.id] = action.payload; // Store by ID
        },
        updateMigration(state, action: PayloadAction<KalturaMigrationDetails>) {
            state.migrations[action.payload.id] = action.payload; // Overwrite existing migration
        },
        setMigrationStatus(state, action: PayloadAction<KalturaMigrationsState['status']>) {
            state.status = action.payload;
        },
        resetMigrationStatus(state, action: PayloadAction<string>) {
            if (state.migrations[action.payload]) {
                state.migrations[action.payload].status = 'pending';
                state.migrations[action.payload].error = undefined;
            }
        },
        loadMigrationsFromLocalStorage(state, action: PayloadAction<number>) {
            const courseId = action.payload;
            const savedMigrations = localStorage.getItem(`kalturaMigrations_${courseId}`);
            if (savedMigrations) {
                const parsedMigrations: KalturaMigrationsState = JSON.parse(savedMigrations);
                state.migrations = parsedMigrations.migrations;
                state.error = parsedMigrations.error;
                state.status = parsedMigrations.status;
            }
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
        abortMigration(state, action: PayloadAction<string>) {
            if (state.migrations[action.payload]) {
                state.migrations[action.payload].status = 'aborted';
                state.migrations[action.payload].error = 'Migration aborted by user.';
            }
        },
    },
});

// Async thunk to collect migration details
export const collectMigrationDetails = createAsyncThunk<void, { courseId: number }, {
    state: RootState,
    dispatch: KalturaAppDispatch;
}>(
    'kaltura/collectMigrationDetails',
    async ({ courseId }, { dispatch, getState }) => {
        const state = getState();
        const existingMigrations = state.kaltura.migrations;

        try {
            const migrationDetails = await getMigrationDetails(courseId); // Fetch migration details

            migrationDetails.forEach(detail => {
                // Update or add migration based on existence
                dispatch(addMigration(detail)); // This will overwrite existing entries
            });

        } catch (error) {
            dispatch(migrationFailed({ id: courseId.toString(), error: (error as Error).message }));
        }
    }
);

// Function to fetch or generate migration details
export async function getMigrationDetails(courseId: number): Promise<KalturaMigrationDetails[]> {
    // TODO: Implement your data fetching logic here
    return []; // Replace with actual fetching logic
}

// Export actions and reducer
export const {
    migrationSucceeded,
    migrationFailed,
    resetKalturaState,
    addMigration,
    updateMigration,
    setMigrationStatus,
    resetMigrationStatus,
    abortMigration,
    loadMigrationsFromLocalStorage, // Load migrations from local storage
    saveMigrationsToLocalStorage, // Save migrations to local storage
} = kalturaMigrationsSlice.actions;

export default kalturaMigrationsSlice.reducer;
