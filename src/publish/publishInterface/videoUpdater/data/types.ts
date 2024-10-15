export interface KalturaMigrationDetails {
    id: string;
    courseId: number;
    pageId?: number | null;
    assignmentId?: number | null;
    link: string;
    status: 'idle' | 'gathering_info' | 'pending' | 'migrating' | 'awaiting_finalization' | 'successful' | 'failed' | 'aborted';
    error?: string | null;
    timestamp: string;
}

export interface KalturaMigrationsState {
    error: string | null;
    migrations: KalturaMigrationDetails[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

export type VideoUpdateInterfaceProps = {
    courseId: number,
}
