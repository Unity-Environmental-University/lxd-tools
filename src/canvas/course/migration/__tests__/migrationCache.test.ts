import {loadCachedCourseMigrations, cacheCourseMigrations, loadCachedMigrations} from "../migrationCache";
import {mockMigrationData} from "@/canvas/course/migration/__mocks__/mockMigrationData";
import {range} from "../../../canvasUtils";

describe('Saving and loading migration states', () => {
    beforeEach(() => {
        localStorage.clear();
    })
    afterEach(() => {
        localStorage.clear();
    })
    it('has base functions that save and load migration data', () => {
        let migrations = loadCachedCourseMigrations(0);
        expect(migrations).toHaveLength(0);

        const cachedKeys:{[key:number] : number} = {};
        for(let i of [...range(0, 5)]) {
            let key = i * 2;
            const migrationsToCache = [...range(1,i)].map( _ => mockMigrationData)
            cacheCourseMigrations(i * 2,  migrationsToCache);
            expect(Object.entries(loadCachedMigrations())).toHaveLength(i + 1)
            cachedKeys[key] = i;
            //Make sure all previous cached migrations have the same value going on.
            for(const [key, value] of Object.entries(cachedKeys)) {
                expect(loadCachedCourseMigrations(key)).toHaveLength(value);
            }
        }
    })

    it('adds new migrations to cached migration list', () => {
        cacheCourseMigrations(1, [{...mockMigrationData, id: 1}])
        expect(loadCachedCourseMigrations(1)).toHaveLength(1);
        cacheCourseMigrations(1, [{...mockMigrationData, id: 2}])
        expect(loadCachedCourseMigrations(1)).toHaveLength(2);
     })

    it('adds new migrations to cached migration list', () => {
        cacheCourseMigrations(1, [{...mockMigrationData, id: 1, workflow_state: 'queued'}])
        expect(loadCachedCourseMigrations(1)).toHaveLength(1);
        cacheCourseMigrations(1, [{...mockMigrationData, id: 1, workflow_state: 'completed', cleanedUp: false}]);
        expect(loadCachedCourseMigrations(1)).toHaveLength(1);
     })


})
