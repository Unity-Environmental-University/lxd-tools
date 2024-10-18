import { createAsyncThunk } from '@reduxjs/toolkit';
import { KalturaMigrationDetails } from "@publish/publishInterface/videoUpdater/data/types";
import { KalturaAppDispatch, RootState } from "@publish/publishInterface/videoUpdater/data/store";
import {migrationFailed, updateMigration} from "@publish/publishInterface/videoUpdater/data/kalturaMigrationsSlice";


// Mock function to query the Kaltura batch migration and get the links
export async function getModifiedLinksFromMigration(migrationId: string): Promise<string[]> {
    // Stub: Replace with actual logic to fetch modified links from Kaltura
    return []; // Return an array of modified links
}

const preFinalizeMigration = createAsyncThunk<void, { id: string }, {
    state: RootState,
    dispatch: KalturaAppDispatch;
}>(
    'kaltura/preFinalizeMigration',
    async ({ id }, { dispatch, getState }) => {
        const state = getState();
        const migration = state.kaltura.migrations[id];

        if (!migration) {
            dispatch(migrationFailed({ id, error: 'Migration not found' }));
            return;
        }

        try {
            // Query the Kaltura batch migration for modified links
            const processedLinks = await getModifiedLinksFromMigration(id);

            // Update the migration details with the retrieved links
            const updatedMigration: KalturaMigrationDetails = {
                ...migration,
                processedLinks, // Add the modified links to the migration details
            };

            // Dispatch the action to update the migration
            dispatch(updateMigration(updatedMigration));
        } catch (error) {
            dispatch(migrationFailed({ id, error: (error as Error).message }));
        }
    }
);

export default preFinalizeMigration;