import {KalturaMigrationsState} from "@publish/publishInterface/videoUpdater/data/types";

export const migrationSelectors = {
  getAllMigrations: (state:KalturaMigrationsState) => state.migrations,
  getMigrationsForCourse: (state:KalturaMigrationsState, courseId:number) =>
    state.migrations.filter(m => m.courseId === courseId),
  getMigrationsForPage: (state:KalturaMigrationsState, pageId:number) =>
    state.migrations.filter(m => m.pageId === pageId),
  getMigrationsForAssignment: (state:KalturaMigrationsState, assignmentId:number) =>
    state.migrations.filter(m => m.assignmentId === assignmentId),
  selectMigrationById: (state:KalturaMigrationsState, id:string) =>
    state.migrations.find(m => m.id === id),
};

export const selectKalturaStatus = (state: { kaltura: KalturaMigrationsState }) => {
    return {
        status: state.kaltura.status,
        error: state.kaltura.error,
        migrations: state.kaltura.migrations
    };
};