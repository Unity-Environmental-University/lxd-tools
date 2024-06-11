import {createNewCourse} from "../../canvas/course";
import {Button, Col, ProgressBar, Row} from "react-bootstrap";
import {FormEvent, useEffect, useReducer, useState} from "react";
import {useEffectAsync} from "../../ui/utils";
import {
    getBlueprintsFromCode,
    getSections,
    getTermNameFromSections,
    IBlueprintCourse,
    retireBlueprint
} from "../../canvas/course/blueprint";
import assert from "assert";
import {bpify} from "../../admin";
import {
    getMigrationProgressGen,
    getMigrationsForCourse,
    IMigrationData,
    IProgressData,
    startMigration
} from "../../canvas/course/migration";
import {Course} from "../../canvas/course/Course";
import {listDispatcher} from "../../reducerDispatchers";


function callOnChangeFunc<T, R>(value: T, onChange: ((value: T) => R) | undefined) {
    const returnValue: [() => any, [T]] = [() => {
        onChange && onChange(value);
    }, [value]];
    return returnValue;
}

export function getSavedMigrations() {
    if (!localStorage.getItem('migrations')) localStorage.setItem('migrations', '[]')
    const migrationDataString = localStorage.getItem('migrations') as string;
    const migrationDataList: IMigrationData[][] = JSON.parse(migrationDataString);
    return migrationDataList;
}

export function getSavedMigrationsForCourse(courseId: number) {
    return getSavedMigrations()[courseId] ?? [];
}

export function saveMigrations(migrations: IMigrationData[][]) {
    localStorage.setItem('migrations', JSON.stringify(migrations));
}

export function saveMigrationsForCourse(courseId: number, courseMigrations: IMigrationData[]) {
    const migrations = getSavedMigrations();
    migrations[courseId] = courseMigrations;
    saveMigrations(migrations);
}

export interface IMakeBpProps {
    devCourse: Course,
    onStartMigration?: () => void,
    onEndMigration?: () => void,
    onBpSet?: (bp: Course | null | undefined) => void,
    onTermNameSet?: (termName: string | null) => void,
    onSectionsSet?: (sections: Course[]) => void,
}

export function MakeBp({
    devCourse,
    onBpSet,
    onTermNameSet,
    onSectionsSet,
}: IMakeBpProps) {
    const [isDev, setIsDev] = useState(devCourse.isDev);
    const [currentBp, setCurrentBp] = useState<Course | null>();
    const [isLoading, setIsLoading] = useState(false);
    const [sections, setSections] = useState<Course[]>([])
    const [termName, setTermName] = useState<string>('');
    const [activeMigrations, migrationDispatcher] = useReducer(listDispatcher<IMigrationData>, []);

    useEffect(...callOnChangeFunc(currentBp, onBpSet));
    useEffect(...callOnChangeFunc(termName, onTermNameSet));
    useEffect(...callOnChangeFunc(sections, onSectionsSet));

    useEffect(() => {
        const migrationData = getSavedMigrationsForCourse(devCourse.id);
        if (migrationData) {
            migrationDispatcher({set: migrationData})
        }
    }, [devCourse]);


    useEffectAsync(async () => {
        setIsDev(devCourse.isDev);
        if (devCourse.parsedCourseCode) {
            await updateBpInfo(devCourse, devCourse.parsedCourseCode);
        }
    }, [devCourse])

    useEffectAsync(async () => {
        await updateMigrations();
    }, [currentBp]);

    async function updateMigrations() {
        if (!currentBp) return;
        migrationDispatcher({
            clear: true,
        })
        let migrations: IMigrationData[] = [];
        for await (let migration of getMigrationsForCourse(currentBp.id)) {
            migrations.push(migration);
            migrationDispatcher({
                add: migration
            })
        }
        saveMigrationsForCourse(currentBp.id, migrations);
    }

    useEffect(() => {
        if (!currentBp) return;
        const savedMigrations = getSavedMigrationsForCourse(currentBp.id);
        migrationDispatcher({
            set: savedMigrations,
        });
    }, [currentBp]);

    async function updateBpInfo(course: Course, code: string) {
        const [bp] = await getBlueprintsFromCode(code, [
            course.rawData.account_id,
            course.rawData.root_account_id
        ]) ?? [];
        setCurrentBp(bp)
    }

    useEffectAsync(async () => {
        if (currentBp && currentBp.isBlueprint()) {
            const sections = await getSections(currentBp);
            setSections(sections);
            try {
                setTermName(await getTermNameFromSections(sections))
            } catch (e) {
                console.warn(e);
                setTermName('')
            }
        }
    }, [currentBp])

    async function onArchive(e: FormEvent) {
        e.preventDefault();
        if (!devCourse.parsedCourseCode) throw Error("Trying to archive without a valid course code");
        if (!currentBp) return false;
        if (termName.length === 0) return false;
        setIsLoading(true);
        await retireBlueprint(currentBp, termName);
        await updateBpInfo(devCourse, devCourse.parsedCourseCode);
        setIsLoading(false);
    }

    async function onCloneIntoBp(e: FormEvent) {
        e.preventDefault();
        if (currentBp) {
            console.warn("Tried to clone while current BP exists")
            return;
        }

        if (typeof devCourse.parsedCourseCode !== 'string') {
            console.warn('Dev course does not have a recognised course code');
            return;
        }
        const accountId = devCourse.accountId;
        const newBpShell = await createNewCourse(bpify(devCourse.parsedCourseCode), accountId);
        setCurrentBp(new Course(newBpShell));
        const migration = await startMigration(devCourse.id, newBpShell.id);
        migrationDispatcher({
            add: migration,
        });
        await updateMigrations();
    }


    function isArchiveDisabled() {
        return isLoading || !currentBp || !termName || termName.length === 0;

    }

    return <div>
        {!isDev && <Row><Col className={'alert alert-warning'}>This is not a DEV course</Col></Row>}
        {currentBp && <Row>
            <Col>
                <label>Term Name</label>
            </Col>
            <input
                id={'archiveTermName'}
                typeof={'text'}
                value={termName}
                disabled={sections?.length > 0}
                onChange={e => setTermName(e.target.value)}
                placeholder={'This should autofill if bp exists and has sections'}
            />
            <Col>
                <Button
                    id={'archiveButton'}
                    onClick={onArchive}
                    disabled={isArchiveDisabled()}
                >Archive {currentBp.parsedCourseCode}</Button>
            </Col>
        </Row>}
        {<>
            <Row><Col sm={6}>
                <Button
                    id={'newBpButton'}
                    onClick={onCloneIntoBp}
                    disabled={isLoading || !!currentBp || !devCourse.parsedCourseCode || devCourse.parsedCourseCode.length == 0}
                >Create New BP For Dev</Button>
            </Col>
                {currentBp && activeMigrations.map(migration => <MigrationBar
                    key={migration.id}
                    migration={migration}
                    course={currentBp}/>)}
            </Row>
        </>}
    </div>
}


type MigrationBarProps = {
    migration: IMigrationData,
    course: Course,
}

function MigrationBar({migration, course}: MigrationBarProps) {
    const [progress, setProgress] = useState<IProgressData>()

    useEffectAsync(async () => {
        let progressGen = getMigrationProgressGen(migration);
        for await(let progress of progressGen) {
            setProgress(progress);
        }
    }, [migration]);


    return <Row>
        <Col sm={4}>
            <Row>
            Status: {progress?.workflow_state}

            </Row>
            <Row>
                Started: {migration.started_at}
            </Row>
        </Col>
        <Col sm={8}>
            <ProgressBar
        min={0}
        max={100}
        now={progress?.completion}/>
        </Col>
    </Row>

}