import {Action, Middleware} from '@reduxjs/toolkit';
import { RootState } from './store'; // Import your RootState type
import { kalturaMigrationsSlice } from "@publish/publishInterface/videoUpdater/data/kalturaMigrationsSlice";

// Type definition for Kaltura migration actions
type KalturaMigrationsActions = ReturnType<typeof kalturaMigrationsSlice.actions[keyof typeof kalturaMigrationsSlice.actions]>;

// Type guard to check if an action is one of the Kaltura migrations actions
const isKalturaMigrationsAction = (action: Action): action is KalturaMigrationsActions => {
    return action.type.startsWith('kalturaMigrations/');
};

const localStorageMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
    const result = next(action); // Pass the action to the next middleware or reducer

    // Use the type guard to check if the action is one of the Kaltura migrations actions
    if (isKalturaMigrationsAction(action)) {
        // Create a set of action types that modify migrations dynamically
        const migrationActionTypes = Object.values(kalturaMigrationsSlice.actions)
            .map(action => action.type) // Get action types from the slice
            .filter(type => [
                'addMigration',
                'updateMigration',
                'migrationSucceeded',
                'migrationFailed',
                'abortMigration',
                'setMigrationStatus',
                'resetMigrationStatus',
            ].includes(type.split('/')[1])); // Filter only relevant actions

        // Check if the action type is in the filtered array of migration action types
        if (migrationActionTypes.includes(action.type)) {
            const state = store.getState().kaltura; // Ensure you are accessing the correct state
            const courseId = state.courseId; // Ensure you have access to the courseId
            localStorage.setItem(`kalturaMigrations_${courseId}`, JSON.stringify(state));
        }
    }

    return result; // Return the result from the next middleware or reducer
};

export default localStorageMiddleware;
