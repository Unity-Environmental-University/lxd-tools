export interface KalturaMigrationDetails {
    id: string;
    courseId: number;
    shortName: string;
    status: 'pending' | 'migrating' | 'successful' | 'failed' | 'aborted' | 'not needed'; // Added 'not needed' status
    error?: string;
    progress: number;
    startTime: string;
    endTime?: string;
    sourceUrl: string;
    contentId: number;
    contentType: 'Assignment' | 'Page';
    videosToProcess: MigrationVideo[]; // Renamed linksToProcess to videosToProcess
    processedVideos: MigrationVideo[]; // Updated processed links to processedVideos
    additionalInfo?: string;
}

export interface MigrationVideo {
    id: string,
    canvasStudioId: string,
    contentId: number,
    courseId: number,
    contentType: KalturaMigrationDetails['contentType'],
    elementHtml: string,
    title: string,
    description: string,
    transcript?: string,
    srt?: string
}

export interface KalturaMigrationsState {
    error: string | undefined;
    courseId?: number;
    migrations: Record<string, KalturaMigrationDetails>;
    status: 'idle' | 'initial_scan' | 'scanning' | 'scan_succeeded' | 'pending_individual_migrations' | 'migrations_finished' | 'failed' | 'error';
}

export type VideoUpdateInterfaceProps = {
    courseId: number,
}
