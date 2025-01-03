// migrations.ts
import {
    MIGRATE_PAGE_START,
    MIGRATE_PAGE_START_SUCCESS,
    MIGRATE_PAGE_START_FAILURE,
    MIGRATE_ASSIGNMENT_START,
    MIGRATE_ASSIGNMENT_START_SUCCESS,
    MIGRATE_ASSIGNMENT_START_FAILURE, MIGRATE_DETAIL_START_SUCCESS, MIGRATE_DETAIL_START_FAILURE,
} from './actionTypes';
import {IPageData} from "@canvas/content/pages/types";
import {KalturaMigrationDetails} from "@publish/publishInterface/videoUpdater/data/types";
import PageKind from "@canvas/content/pages/PageKind";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";
import {IAssignmentData} from "@canvas/content/types";



export const migrationStart = (migrationRow:IAssignmentData | IPageData | KalturaMigrationDetails) => {
    if(PageKind.dataIsThisKind(migrationRow)) return migratePageStart(migrationRow)
    if(AssignmentKind.dataIsThisKind(migrationRow)) return migrateAssignmentStart(migrationRow);
    return migrationDetailsStart(migrationRow);
}


export const migrationDetailsStart = (migration:KalturaMigrationDetails) => {
    return async (dispatch: any) => {
        dispatch({ type: MIGRATE_PAGE_START });
        try {
            // Your migration logic here
            console.log(`Migrating page: ${migration.shortName}`);
            // Simulate async operation
            await new Promise((resolve) => setTimeout(resolve, 1000));
            dispatch({ type: MIGRATE_DETAIL_START_SUCCESS, payload: migration });
        } catch (error) {
            dispatch({ type: MIGRATE_DETAIL_START_FAILURE, error });
        }
    };

}


export const migratePageStart = (pageData: IPageData) => {
    return async (dispatch: any) => {
        dispatch({ type: MIGRATE_PAGE_START });
        try {
            // Your migration logic here
            console.log(`Migrating page: ${pageData.title}`);
            // Simulate async operation
            await new Promise((resolve) => setTimeout(resolve, 1000));
            dispatch({ type: MIGRATE_PAGE_START_SUCCESS, payload: pageData });
        } catch (error) {
            dispatch({ type: MIGRATE_PAGE_START_FAILURE, error });
        }
    };
};

export const migrateAssignmentStart = (assignmentData: IAssignmentData) => {
    return async (dispatch: any) => {
        dispatch({ type: MIGRATE_ASSIGNMENT_START });
        try {
            // Your migration logic here
            console.log(`Migrating assignment: ${assignmentData.name}`);
            // Simulate async operation
            await new Promise((resolve) => setTimeout(resolve, 1000));
            dispatch({ type: MIGRATE_ASSIGNMENT_START_SUCCESS, payload: assignmentData });
        } catch (error) {
            dispatch({ type: MIGRATE_ASSIGNMENT_START_FAILURE, error });
        }
    };
};
