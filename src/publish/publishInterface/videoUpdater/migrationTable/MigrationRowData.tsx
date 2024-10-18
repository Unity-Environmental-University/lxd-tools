export interface MigrationRowData {
    id: string; // or any unique identifier
    shortName: string;
    status: string;
    progress: number;
    startTime?: Date;
    endTime?: Date;
    error?: string;
    sourceUrl: string;
    destinationUrl: string;
    additionalInfo?: string;
    // Add any other relevant fields for rendering the row
}