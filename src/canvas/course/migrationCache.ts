import {IMigrationData} from "./migration";

export type SavedMigration = IMigrationData & {
    tracked?: boolean,
    cleanedUp?: boolean,
}

export function loadCachedMigrations() {
    if (!localStorage.getItem('migrations')) localStorage.setItem('migrations', '{}')
    const migrationDataString = localStorage.getItem('migrations') as string;
    const migrationDataList: Record<string, SavedMigration[]> = JSON.parse(migrationDataString) ?? {};
    return migrationDataList;
}

export function loadCachedCourseMigrations(courseId: number | string) {
    let key = courseId.toString();
    return loadCachedMigrations()[key] ?? [];
}


export type CacheCourseMigrationOptions = {
    cachedMigrations?: ReturnType<typeof loadCachedMigrations>,
}

export function cacheCourseMigrations(courseId: number, toCacheMigrations: SavedMigration[], options?:CacheCourseMigrationOptions) {
    let {cachedMigrations} = options ?? {};
    cachedMigrations ??= loadCachedMigrations();
    const cachedCourseMigrations = loadCachedCourseMigrations(courseId);

    function getToCacheVersion(migrationId: number) {
        const migrations = toCacheMigrations.filter(toCache => toCache.id === migrationId);
        if(migrations.length === 0) return undefined;
        return migrations[0] as SavedMigration;
    }

    function hasCachedVersion(migrationId: number) {
        const migrations = cachedCourseMigrations.filter(cached => cached.id === migrationId);
        return migrations.length > 0;
    }


    let updatingMigrations = cachedCourseMigrations.map(cachedCourseMigration => ({
            ...cachedCourseMigration,
            ...getToCacheVersion(cachedCourseMigration.id),
    }))
    const remainingMigrations = toCacheMigrations.filter(migration => !hasCachedVersion(migration.id))

    updatingMigrations = [
        ...updatingMigrations,
        ...remainingMigrations,
    ].toSorted((a, b) => a.id - b.id);

    cachedMigrations[courseId.toString()] = updatingMigrations;
    localStorage.setItem('migrations', JSON.stringify(cachedMigrations));
    return cachedMigrations;
}