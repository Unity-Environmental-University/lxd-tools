import {Middleware, UnknownAction} from '@reduxjs/toolkit';
import { RootState } from './store'; // Import RootState type

// Utility function to determine which parts of the state need to be persisted
const shouldPersistState = (actionType: string) => {
    // You can define action types that require localStorage persistence here
    // For now, we just return true for any action to be persistent
    return true; // You could extend this to be more specific
};

// General localStorage middleware that persists the entire state (or part of it)
export const localStorageMiddleware: Middleware<RootState> = (store) => (next) => (action) => {
    const result = next(action);  // Proceed with the action


    // Check if the action should trigger a state persistence
    if (shouldPersistState((action as UnknownAction)['type'])) {
        // Store the entire state (or a specific part) to localStorage
        const state = store.getState(); // Grab the entire state
        const stateToPersist = state.kaltura; // For example, only the `kaltura` state

        // Optionally, decide on the localStorage key dynamically
        const courseId = stateToPersist?.courseId;
        if (courseId) {
            localStorage.setItem(`kalturaMigrations_${courseId}`, JSON.stringify(stateToPersist));
        }
    }

    return result; // Return the action result
};
