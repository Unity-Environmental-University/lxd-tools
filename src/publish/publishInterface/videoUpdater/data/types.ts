export interface KalturaMigrationDetails {
    id: string; // Unique identifier for the migration
    courseId: number; // ID of the course being migrated
    shortName: string,
    status: 'pending' | 'migrating' | 'successful' | 'failed' | 'aborted'; // Current migration status
    error?: string; // Error message, if any
    progress: number; // Percentage of completion (0-100)
    startTime: Date; // Migration start time
    endTime?: Date; // Migration end time, if completed
    sourceUrl: string; // URL of the source video
    destinationUrl: string; // URL of the destination video
    contentId: number,
    contentType: 'Assignment' | 'Page',
    linksToProcess: string[],
    processedLinks: string[],
    additionalInfo?: string; // Any additional information related to the migration
}
export interface KalturaMigrationsState {
    error: string | null;
    migrations: Record<string, KalturaMigrationDetails>;
    status: 'idle' | 'initial_scan' | 'scanning' | 'scan_succeeded' | 'pending_individual_migrations' | 'migrations_finished' | 'failed' | 'error';
}

export type VideoUpdateInterfaceProps = {
    courseId: number,
}
