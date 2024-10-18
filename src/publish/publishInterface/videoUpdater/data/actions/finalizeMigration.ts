import { RootState } from "../store";
import {KalturaAppDispatch} from "@publish/publishInterface/videoUpdater/data/store";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {migrationFailed, updateMigration} from "@publish/publishInterface/videoUpdater/data/kalturaMigrationsSlice";

// Mock function to apply the modified links to the relevant pages and assignments
export async function applyModifiedLinksToPages(modifiedLinks: string[]): Promise<void> {
    // Stub: Replace with actual logic to apply links to the pages/assignments
}

const finalizeMigration = createAsyncThunk<void, { id: string }, {
    state: RootState,
    dispatch: KalturaAppDispatch;
}>(
    'kaltura/finalizeMigration',
    async ({ id }, { dispatch, getState }) => {
        const state = getState();
        const migration = state.kaltura.migrations[id];

        if (!migration) {
            dispatch(migrationFailed({ id, error: 'Migration not found' }));
            return;
        }

        try {
            // Apply the modified links from the migration details to the pages and assignments
            await applyModifiedLinksToPages(migration.processedLinks);

            // Update migration status to 'successful' if the application is successful
            dispatch(updateMigration({ ...migration, status: 'successful' }));
        } catch (error) {
            dispatch(migrationFailed({ id, error: (error as Error).message }));
        }
    }
);

export default finalizeMigration;