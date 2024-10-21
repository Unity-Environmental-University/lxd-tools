import {IAssignmentData} from "@canvas/content/assignments/types";
import {IPageData} from "@canvas/content/pages/types";
import {KalturaMigrationDetails} from "@publish/publishInterface/videoUpdater/data/types";
import {MigrationRowData} from "@publish/publishInterface/videoUpdater/migrationTable/MigrationRowData";

// Define the union type for transformable data
export type TransformableData = KalturaMigrationDetails | IPageData | IAssignmentData;

const transformToMigrationRowData = (migration?: TransformableData): MigrationRowData => {
    if (!migration) {
        return {
            shortName: "N/A",
            status: "Not Available",
            progress: 0,
            startTime: undefined,
            endTime: undefined,
            error: undefined,
            sourceUrl: "",
            additionalInfo: undefined,
            id: "", // or whatever default ID you need
        };
    }

    // Handle each type accordingly
    if ('status' in migration) { // Assuming KalturaMigrationDetails has a 'status' field
        return {
            shortName: migration.shortName,
            status: migration.status,
            progress: migration.progress,
            startTime: migration.startTime,
            endTime: migration.endTime,
            error: migration.error,
            sourceUrl: migration.sourceUrl,
            additionalInfo: migration.additionalInfo,
            id: migration.id, // Or whatever unique identifier you need
        };
    } else if ('page_id' in migration) { // This is IPageData
        return {
            shortName: migration.title,
            status: "Page Data",
            progress: 100, // Example fixed value
            startTime: migration.created_at ? new Date(migration.created_at) : undefined,
            endTime: undefined,
            error: undefined,
            sourceUrl: migration.url,
            additionalInfo: undefined,
            id: migration.page_id.toString(), // Using page_id as the identifier
        };
    } else if ('id' in migration) { // This is IAssignmentData
        return {
            shortName: migration.name,
            status: "Assignment Data",
            progress: migration.has_overrides ? 50 : 0, // Example based on a condition
            startTime: migration.created_at ? new Date(migration.created_at) : undefined,
            endTime: migration.updated_at ? new Date(migration.updated_at) : undefined,
            error: undefined,
            sourceUrl: migration.html_url,
            additionalInfo: undefined,
            id: migration.id.toString(),
        };
    }

    // Default return value in case no conditions match
    return {
        shortName: "Unknown",
        status: "Unknown",
        progress: 0,
        startTime: undefined,
        endTime: undefined,
        error: undefined,
        sourceUrl: "",
        additionalInfo: undefined,
        id: "",
    };
};


export default transformToMigrationRowData;