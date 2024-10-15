import { IPageData } from "@canvas/content/pages/types";
import {IAssignmentData} from "@canvas/content/assignments/types";
import {KalturaAppDispatch, RootState} from "@publish/publishInterface/videoUpdater/data/store";
import {createAsyncThunk} from "@reduxjs/toolkit";

// Migration function that handles processing a single page
export const migratePageStart =  createAsyncThunk<void, IPageData, { dispatch: KalturaAppDispatch }>(
    'kaltura/migratePageStart',
    async(page, { dispatch, getState }) => {

    // Implement the actual migration logic for the page
    try {
        // Perform the migration logic here, such as calling APIs, processing data, etc.
        console.log(`Migrating page: ${page.id}`);
    } catch (error) {
        console.error("Migration failed for page:", page.id, error);
        throw error;
    }
});

export const migrateAssignmentStart = createAsyncThunk<void, IAssignmentData,
    { dispatch: KalturaAppDispatch, state: RootState }
>(
    'kaltura/migrateAssignentStart',
    async (assignment, { dispatch, getState }) => {
    try {

        console.log(`Migrating assignment: ${assignment.id}`);
    } catch (error) {
        console.error("Migration failed for assignment:", assignment.id, error);
        throw error;
    }
});
