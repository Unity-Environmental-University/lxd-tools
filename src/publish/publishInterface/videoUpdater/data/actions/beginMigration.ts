import {KalturaAppDispatch, RootState} from "../store";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {KalturaMigrationDetails, MigrationVideo} from "@publish/publishInterface/videoUpdater/data/types";
import {addMigration, updateMigration} from "@publish/publishInterface/videoUpdater/data/kalturaMigrationsSlice";



export const beginMigration = createAsyncThunk<void, { courseId: number }, {
    state: RootState,
    dispatch: KalturaAppDispatch;
}>(
    'kaltura/collectMigrationDetails',
    async ({ courseId }, { dispatch, getState }) => {
        const state = getState();
        const existingMigrations = state.kaltura.migrations;
        const existingMigration = existingMigrations[courseId.toString()];

        if (!existingMigration) {
            // Create a new migration entry if it doesn't exist
            const newMigration: KalturaMigrationDetails = {
                id: courseId.toString(),
                courseId,
                shortName: 'Migration for Course ' + courseId,
                status: 'pending',
                progress: 0,
                startTime: new Date().toISOString(),
                sourceUrl: '', // Populate as needed
                contentId: courseId, // Use courseId as contentId for simplicity
                contentType: 'Page', // Default; adjust based on context
                videosToProcess: [], // Will populate during scanning
                processedVideos: [], // Initially empty
                additionalInfo: '',
            };
            dispatch(addMigration(newMigration));
        } else {
            // If migration exists, update its status and load links
            dispatch(updateMigration({ ...existingMigration, status: 'pending' }));
        }

        // Perform the scanning logic to find videos
        const videosToProcess = await scanForLinks(courseId); // Scan for links
        if (videosToProcess.length === 0) {
            // If no videos found, update the status to 'not needed'
            dispatch(updateMigration({ ...existingMigration, status: 'not needed' }));
        } else {
            // Process the found videos and update the migration state
            dispatch(updateMigration({ ...existingMigration, videosToProcess }));
        }
    }
);

// Function to scan for Canvas Studio links in a given course's page
async function scanForLinks(courseId: number): Promise<MigrationVideo[]> {
    const videosToProcess: MigrationVideo[] = [];

    // Assuming `document.body` contains the HTML we need to scan
    const iframes = document.querySelectorAll('iframe');
    const anchors = document.querySelectorAll('a');

    // Check iframes for Canvas Studio content
    iframes.forEach(iframe => {
        const src = iframe.src;
        if (src.includes('canvasstudio')) { // Replace with actual identifier for Canvas Studio
            const videoId = extractCanvasStudioId(src); // Implement this function to extract the video ID
            const elementHtml = iframe.outerHTML; // Save the HTML of the iframe
            videosToProcess.push({
                id: generateUniqueId(), // Implement a unique ID generation function
                canvasStudioId: videoId,
                contentId: courseId, // Assuming this relates to the course
                courseId,
                contentType: 'Page', // Or 'Assignment', as applicable
                elementHtml,
                title: 'Video Title', // Replace with actual title extraction
                description: 'Video Description', // Replace with actual description extraction
                // Optional fields
                transcript: undefined,
                srt: undefined,
            });
        }
    });

    // Check anchor tags for Canvas Studio links
    anchors.forEach(anchor => {
        const href = anchor.href;
        if (href.includes('canvasstudio')) {
            const videoId = extractCanvasStudioId(href); // Implement this function to extract the video ID
            videosToProcess.push({
                id: generateUniqueId(),
                canvasStudioId: videoId,
                contentId: courseId,
                courseId,
                contentType: 'Assignment', // Assuming links are to assignments; adjust if needed
                elementHtml: anchor.outerHTML,
                title: anchor.innerText, // Use the link text as the title
                description: 'Video Description', // You might want to add logic for actual descriptions
                // Optional fields
                transcript: undefined,
                srt: undefined,
            });
        }
    });

    return videosToProcess;
}

// Dummy function to generate unique IDs; implement as needed
function generateUniqueId(): string {
    return 'video-' + Math.random().toString(36).substr(2, 9);
}

// Dummy function to extract Canvas Studio ID from the URL; implement as needed
function extractCanvasStudioId(url: string): string {
    const matches = url.match(/canvasstudio\/(\w+)/);
    return matches ? matches[1] : 'unknown';
}