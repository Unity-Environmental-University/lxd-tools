import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import { KalturaMigrationDetails, KalturaMigrationsState } from "@publish/publishInterface/videoUpdater/data/types";
import {KalturaAppDispatch, RootState} from "@publish/publishInterface/videoUpdater/data/store";

const initialState: KalturaMigrationsState = {
    error: null,
    migrations: [],
    status: 'idle',  // Added overall migration status
};

const kalturaMigrationsSlice = createSlice({
    name: 'kalturaMigrations',
    initialState,
    reducers: {
        migrationSucceeded(state, action: PayloadAction<KalturaMigrationDetails>) {
            state.migrations.push(action.payload);
        },
        migrationFailed(state, action: PayloadAction<{ id: string; error: string }>) {
            const index = state.migrations.findIndex(m => m.id === action.payload.id);
            if (index >= 0) {
                state.migrations[index].status = 'failed';
                state.migrations[index].error = action.payload.error;
            }
        },
        resetKalturaState(state) {
            state.error = null;
            state.migrations = [];
        },
        addMigration(state, action: PayloadAction<KalturaMigrationDetails>) {
            state.migrations.push(action.payload);
        },
        updateMigration(state, action: PayloadAction<KalturaMigrationDetails>) {
            const index = state.migrations.findIndex(m => m.id === action.payload.id);
            if (index >= 0) {
                state.migrations[index] = action.payload;
            }
        },
        setMigrationStatus(state, action: PayloadAction<KalturaMigrationsState['status']>) {
            state.status = action.payload;
        },
        resetMigrationStatus(state, action: PayloadAction<string>) {
            const index = state.migrations.findIndex(m => m.id === action.payload);
            if (index >= 0) {
                state.migrations[index].status = 'pending';
                state.migrations[index].error = null;
            }
        },
        startBatchMigration(state) {
            state.migrations.forEach(migration => {
                migration.status = 'migrating';
            });
        },
        finalizeBatchMigration(state) {
            state.migrations.forEach(migration => {
                if (migration.status === 'migrating') {
                    migration.status = 'successful';
                }
            });
        },
        abortMigration(state, action: PayloadAction<string>) {
            const index = state.migrations.findIndex(m => m.id === action.payload);
            if (index >= 0) {
                state.migrations[index].status = 'aborted';
                state.migrations[index].error = 'Migration aborted by user.';
            }
        },
    }
});

export const collectMigrationDetails = createAsyncThunk<void, { courseId: number }, {
    state: RootState,
    dispatch: KalturaAppDispatch;   // Use your defined AppDispatch here
}>(
    'kaltura/collectMigrationDetails',
    async ({ courseId }, { dispatch, getState }) => {
        try {
            const migrationDetails = await getMigrationDetails(courseId); // Your async logic
            migrationDetails.forEach(detail => {
                dispatch(addMigration(detail)); // Assuming addMigration is an action creator.
            });
        } catch (error) {
            dispatch(migrationFailed({ id: courseId.toString(), error: (error as Error).message }));
        }
    }
);

export async function getMigrationDetails(courseId:number) {
    return [] as KalturaMigrationDetails[]
}

export const {
    migrationSucceeded,
    migrationFailed,
    resetKalturaState,
    addMigration,
    updateMigration,
    setMigrationStatus,
    resetMigrationStatus,
    startBatchMigration,
    finalizeBatchMigration,
    abortMigration,
} = kalturaMigrationsSlice.actions;

export default kalturaMigrationsSlice.reducer;