import {
    addMigration,
    migrationSucceeded,
    migrationFailed,
    loadMigrationsFromLocalStorage,
    saveMigrationsToLocalStorage, kalturaMigrationsReducer,
} from '../kalturaMigrationsSlice';
import {KalturaMigrationDetails, KalturaMigrationsState} from "@publish/publishInterface/videoUpdater/data/types";  // Adjust this path based on your folder structure

// Define an initial state
const initialState: KalturaMigrationsState = {
    error: undefined,
    courseId: undefined,
    migrations: {},
    status: 'idle',
};

const mockMigrationDetails: KalturaMigrationDetails = {
    contentId: 0,
    contentType: 'Assignment',
    courseId: 0,
    id: "",
    processedVideos: [],
    progress: 0,
    shortName: "",
    sourceUrl: "",
    startTime: "",
    status: 'pending',
    videosToProcess: []

}

const reducer = kalturaMigrationsReducer;

describe('kalturaMigrationsSlice', () => {

    it('should handle adding a new migration', () => {
        const newMigration: KalturaMigrationDetails = {...mockMigrationDetails, id: '1', status: 'pending', error: undefined};

        const nextState = reducer(initialState, addMigration(newMigration));

        expect(nextState.migrations['1']).toEqual(newMigration);
        expect(nextState.migrations['1'].status).toBe('pending');
    });

    it('should not add a migration if the status is not pending', () => {
        const newMigration: KalturaMigrationDetails = {...mockMigrationDetails, id: '1', status: 'successful', error: undefined};

        const nextState = kalturaMigrationsReducer(initialState, addMigration(newMigration));

        expect(nextState.migrations['1']).toBeUndefined();  // Migration shouldn't be added
    });

    it('should handle migration success', () => {
        const migration: KalturaMigrationDetails = {...mockMigrationDetails, id: '1', status: 'pending', error: undefined};
        const previousState = {
            ...initialState,
            migrations: {'1': migration},
        };

        const updatedMigration = {...migration, status: 'successful'} as KalturaMigrationDetails;
        const nextState = kalturaMigrationsReducer(previousState, migrationSucceeded(updatedMigration));

        expect(nextState.migrations['1'].status).toBe('successful');
    });

    it('should handle migration failure', () => {
        const migration: KalturaMigrationDetails = {...mockMigrationDetails, id: '1', status: 'pending', error: undefined};
        const previousState = {
            ...initialState,
            migrations: {'1': migration},
        };

        const failedAction = {id: '1', error: 'An error occurred'};
        const nextState = reducer(previousState, migrationFailed(failedAction));

        expect(nextState.migrations['1'].status).toBe('failed');
        expect(nextState.migrations['1'].error).toBe('An error occurred');
    });

    describe('localStorage tests', () => {
        beforeEach(() => {
            jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
            jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
        });


        it('should save migrations to local storage', () => {
            const previousState: KalturaMigrationsState = {
                ...initialState,
                migrations: {'1': {...mockMigrationDetails,   id: '1', status: 'successful', error: undefined}},
                error: undefined,
                status: 'scan_succeeded',
            };

            reducer(previousState, saveMigrationsToLocalStorage(123));

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'kalturaMigrations_123',
                JSON.stringify({
                    migrations: previousState.migrations,
                    error: undefined,
                    status: 'scan_succeeded',
                })
            );
        });

        it('should load migrations from local storage', () => {
            const savedState = {
                migrations: {'1': {id: '1', status: 'completed', error: undefined}},
                error: undefined,
                status: 'completed',
            };

            (localStorage.getItem as jest.Mock).mockReturnValueOnce(JSON.stringify(savedState));

            const nextState = reducer(initialState, loadMigrationsFromLocalStorage(123));

            expect(nextState.migrations['1'].status).toBe('completed');
        });

    })
});
