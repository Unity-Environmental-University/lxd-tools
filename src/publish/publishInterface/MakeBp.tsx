import {createNewCourse, getCourseName} from "@/canvas/course";
import {Button, Col, FormControl, FormText, Row} from "react-bootstrap";
import {FormEvent, useEffect, useReducer, useState} from "react";
import {useEffectAsync} from "@/ui/utils";
import {
    getBlueprintsFromCode,
    getSections,
    getTermNameFromSections, lockBlueprint,
    retireBlueprint, sectionDataGenerator, setAsBlueprint
} from "@/canvas/course/blueprint";
import {bpify} from "@/admin";
import {getMigrationsForCourse, IMigrationData, startMigration} from "@/canvas/course/migration";
import {Course} from "@/canvas/course/Course";
import {listDispatcher} from "@/ui/reducerDispatchers";
import {
    loadCachedCourseMigrations,
    SavedMigration,
    cacheCourseMigrations,
    loadCachedMigrations
} from "@/canvas/course/migration/migrationCache";
import {MigrationBar} from "./MigrationBar";
import assert from "assert";
import {SectionData} from "@/canvas/courseTypes";

function callOnChangeFunc<T, R>(value: T, onChange: ((value: T) => R) | undefined) {
    const returnValue: [() => any, [T]] = [() => {
        onChange && onChange(value);
    }, [value]];
    return returnValue;
}

export interface IMakeBpProps {
    devCourse: Course,
    onStartMigration?: () => void,
    onEndMigration?: () => void,
    onBpSet?: (bp: Course | null | undefined) => void,
    onTermNameSet?: (termName: string | null) => void,
    onSectionsSet?: (sections: SectionData[]) => void,
    onActiveImports?: (migrations: IMigrationData[]) => void,
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
    const [sections, setSections] = useState<SectionData[]>([])
    const [termName, setTermName] = useState<string>('');
    const [allMigrations, allMigrationDispatcher] = useReducer(listDispatcher<SavedMigration>, []);
    const [activeMigrations, activeMigrationDispatcher] = useReducer(listDispatcher<SavedMigration>, []);
    const [isLocking, setIsLocking] = useState(false);

    useEffect(...callOnChangeFunc(currentBp, onBpSet));
    useEffect(...callOnChangeFunc(termName, onTermNameSet));
    useEffect(...callOnChangeFunc(sections, onSectionsSet));

    useEffect(() => {
        const migrationData = loadCachedCourseMigrations(devCourse.id);
        if (migrationData) {
            allMigrationDispatcher({set: migrationData})
        }
    }, [devCourse]);

    useEffect(() => {
        const activeMigrations = allMigrations.filter(migration => migration.tracked && !migration.cleanedUp);
        activeMigrationDispatcher({
          set: activeMigrations
        })
    }, [allMigrations])

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
        allMigrationDispatcher({
            clear: true,
        })
        const migrationsForCourse = getMigrationsForCourse(currentBp.id);
        for await (let migration of migrationsForCourse) {
            cacheCourseMigrations(currentBp.id, [migration]);
            allMigrationDispatcher({
                add: migration
            })
        }

    }

    useEffect(() => {
        if (!currentBp) return;
        const savedMigrations = loadCachedCourseMigrations(currentBp.id);
        allMigrationDispatcher({
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
            let sections:SectionData[] = [];
            const sectionGen = sectionDataGenerator(currentBp.id);
            for await (let sectionData of sectionGen ) {
                sections.push(sectionData);
                if(sectionData.term_name) setTermName(sectionData.term_name)
            }
            setSections(sections);
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
        const bpCode = bpify(devCourse.parsedCourseCode);
        let bpName = `${bpCode}: ${getCourseName(devCourse.rawData)}`;
        if(devCourse.courseCode && devCourse.name.match(devCourse.courseCode)) {
            bpName = devCourse.name.replace(devCourse.courseCode, bpCode)
        }
        const newBpShell = await createNewCourse(bpify(devCourse.parsedCourseCode), accountId, bpName);
        setCurrentBp(new Course(newBpShell));
        const migration = await startMigration(devCourse.id, newBpShell.id) as SavedMigration;
        migration.tracked = true;
        migration.cleanedUp = false;
        cacheCourseMigrations(newBpShell.id, [migration])
        allMigrationDispatcher({
            add: migration,
        });
        await updateMigrations();
    }

    async function finishMigration(migration:SavedMigration) {
        assert(currentBp);
        setIsLocking(true);
        await setAsBlueprint(currentBp.id);
        await lockBlueprint(currentBp.id, await currentBp.getModules())
        migration.cleanedUp = true;
        cacheCourseMigrations(currentBp.id, [migration])
        const [newBp] = await getBlueprintsFromCode(
            devCourse.parsedCourseCode ?? '',
            [devCourse.accountId]
            ) ?? [];
        setIsLocking(false);
        window.open(newBp.htmlContentUrl);
        location.reload();


    }


    function isArchiveDisabled() {
        return isLoading || !currentBp || !termName || termName.length === 0 || activeMigrations.length > 0;

    }

    return <div>
        {!isDev && <Row><Col className={'alert alert-warning'}>This is not a DEV course</Col></Row>}
        {currentBp && <Row>
            <Col sm={3}>
                <Button
                    id={'archiveButton'}
                    onClick={onArchive}
                    disabled={isArchiveDisabled()}
                >Archive {currentBp.parsedCourseCode}</Button>
            </Col>
            <Col sm={2}>
                <label>Term Name</label>
            </Col>
            <Col sm={3}>
                <FormControl
                    required={true}
                    aria-required={true}
                    id={'archiveTermName'}
                    typeof={'text'}
                    value={termName}
                    disabled={sections?.length > 0}
                    onChange={e => setTermName(e.target.value)}
                    placeholder={'DE8W.12.31.99'}
                />

            </Col>
            <Col>
                <FormText>Term Name autofills if there is a BP with sections</FormText>
            </Col>
        </Row>}
        <hr/>
        {<>
            <Row><Col sm={3}>
            <Button
                    id={'newBpButton'}
                    onClick={onCloneIntoBp}
                    aria-label={'New BP'}
                    disabled={isLoading ||
                        !!currentBp ||
                        !devCourse.parsedCourseCode ||
                        devCourse.parsedCourseCode.length == 0
                    }
                >Create New BP</Button>
            </Col>
                <Col sm={6}>
                    {currentBp && activeMigrations.map(migration => <MigrationBar
                        key={migration.id}
                        migration={migration}
                        onFinishMigration={finishMigration}
                        course={currentBp}/>)}
                </Col>
            </Row>
        </>}
    </div>
}


