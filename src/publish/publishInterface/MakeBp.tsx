import {createNewCourse, getCourseById, getCourseName} from "@ueu/ueu-canvas/course";
import {Alert, Button, Col, FormControl, FormText, Row} from "react-bootstrap";
import {FormEvent, useEffect, useReducer, useState} from "react";
import {useEffectAsync} from "@/ui/utils";
import {
    getBlueprintsFromCode,
    lockBlueprint,
    sectionDataGenerator, setAsBlueprint
} from "@ueu/ueu-canvas/course/blueprint";
import {bpify} from "@/admin";
import {migrationsForCourseGen, IMigrationData, startMigration} from "@ueu/ueu-canvas/course/migration";
import {Course} from "@ueu/ueu-canvas/course/Course";
import {listDispatcher} from "@/ui/reducerDispatchers";
import {
    loadCachedCourseMigrations,
    SavedMigration,
    cacheCourseMigrations
} from "@ueu/ueu-canvas/course/migration/migrationCache";
import {DevToBpMigrationBar} from "./DevToBpMigrationBar";
import assert from "assert";
import {SectionData} from "@ueu/ueu-canvas/courseTypes";
import dateFromTermName from "@ueu/ueu-canvas/term/dateFromTermName";
import {Temporal} from "temporal-polyfill";
import {retireBlueprint} from "@ueu/ueu-canvas/course/retireBlueprint";
import { academicIntegritySetup } from "./academicIntegritySetup";
import {fetchJson} from "@ueu/ueu-canvas/fetch/fetchJson";
import {formDataify} from "@ueu/ueu-canvas/canvasUtils";


export const TERM_NAME_PLACEHOLDER = 'Fill in term name here to archive.'

function callOnChangeFunc<T, R>(value: T, onChange: ((value: T) => R) | undefined) {
    const returnValue: [() => any, [T]] = [() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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

export async function waitForMigrationCompletion(courseId: number, migrationId: number, intervalMs = 5000, timeoutMs = 300000) {
    const start = Date.now();

    while (true) {
        const migration = await fetchJson(`/api/v1/courses/${courseId}/content_migrations/${migrationId}`);

        if (migration.workflow_state === "completed" || migration.workflow_state === "failed") {
            return migration;
        }

        if (Date.now() - start > timeoutMs) {
            throw new Error("Migration wait timed out after 5 minutes.");
        }

        console.log(`Migration still ${migration.workflow_state}... waiting ${intervalMs / 1000}s`);
        await new Promise(res => setTimeout(res, intervalMs));
    }
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
    const [isArchiveDisabled, setIsArchiveDisabled] = useState(true);
    const [isNewBpDisabled, setIsNewBpDisabled] = useState(true);
    const [isRunningIntegritySetup, setIsRunningIntegritySetup] = useState(false);
    const [isCloningBp, setCloningBp] = useState(false);
    const academicIntegrityText = isRunningIntegritySetup ? 'Setting up...' : `Setup Academic Integrity`;
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


    useEffect(() => {
        const isDisabled = isLoading || !currentBp || !termName || termName.length === 0 || activeMigrations.length > 0;
        setIsArchiveDisabled(isDisabled);
    }, [isLoading, currentBp, termName, activeMigrations]);


    useEffect(() => {
        const isDisabled = isLoading ||
            !!currentBp ||
            !devCourse.parsedCourseCode ||
            devCourse.parsedCourseCode.length == 0
        setIsNewBpDisabled(isDisabled);
    }, [isLoading, currentBp, devCourse])

    async function updateMigrations() {
        if (!currentBp) return;
        allMigrationDispatcher({
            clear: true,
        })
        const migrationsForCourse = migrationsForCourseGen(currentBp.id);
        for await (const migration of migrationsForCourse) {
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
            const sections: SectionData[] = [];
            const sectionGen = sectionDataGenerator(currentBp.id);
            if (sections.length > 0) {
                for await (const sectionData of sectionGen) {
                    sections.push(sectionData);
                    if (sectionData.term_name) setTermName(sectionData.term_name);
                }
            } else {
                const syllabusBody = document.createElement('div');
                let currentBpSyllabus = '';

                if (typeof currentBp.getSyllabus === 'function') {
                    currentBpSyllabus = await currentBp.getSyllabus();
                } else {
                    console.warn('Current BP does not have a getSyllabus function');
                    return;
                }

                syllabusBody.innerHTML = currentBpSyllabus;
                const syllabusCalloutBox = syllabusBody.querySelector('div.cbt-callout-box');
                if (syllabusCalloutBox) {
                    const paras = Array.from(syllabusCalloutBox.querySelectorAll('p'));
                    const strongParas = paras.filter((para) => para.querySelector('strong'));
                    const termNameEl = strongParas[1];

                    setTermName(termNameEl.textContent?.trim().replace(/^.*:\s*/, '') ?? '');
                }
            }
            setSections(sections);
        }
    }, [currentBp])

    async function onArchive(e: FormEvent) {
        e.preventDefault();
        if (!devCourse.parsedCourseCode) throw Error("Trying to archive without a valid course code");
        if (!currentBp) return false;
        if (termName.length === 0) return false;
        const termDate = dateFromTermName(termName);
        if (termDate) {
            const daysLeft = termDate.until(Temporal.Now.plainDateISO()).days;
            if (daysLeft <= 5) {
                const confirmFinish = confirm(`Term ${termName} appears to still be in the future. Are you SURE you want to archive?`)
                if (!confirmFinish) return;

            }
        }

        setIsLoading(true);
        await retireBlueprint(currentBp, termName);
        await updateBpInfo(devCourse, devCourse.parsedCourseCode);
        setIsLoading(false);
    }

    async function onCloneIntoBp(e: FormEvent) {
        e.preventDefault();
        setCloningBp(true);
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
        if (devCourse.courseCode && devCourse.name.match(devCourse.courseCode)) {
            bpName = devCourse.name.replace(devCourse.courseCode, bpCode)
        }
        const newBpShell = await createNewCourse(bpify(devCourse.parsedCourseCode), accountId, bpName);
        setCurrentBp(new Course(newBpShell));
        const startedMigration = await startMigration(devCourse.id, newBpShell.id) as SavedMigration;
        startedMigration.tracked = true;
        startedMigration.cleanedUp = false;
        cacheCourseMigrations(newBpShell.id, [startedMigration]);
        allMigrationDispatcher({add: startedMigration});
        await updateMigrations();

        console.log("Waiting for migration to complete...");
        const migration = await waitForMigrationCompletion(newBpShell.id, startedMigration.id);
        console.log("Migration finished with state:", migration.workflow_state);
        //Get assignment groups in BP
        //For each, if there's one with name Assignments, check if it's empty, if it is, kill it and stop.
        if (migration.workflow_state === "completed") {
            console.log("We be in the completed state, baby.");
            try {
                const bpCourse = await getCourseById(newBpShell.id);
                if (!bpCourse) throw new Error("We couldn't get the BP course");
                console.log("BP Course ", bpCourse);
                const bpAssignmentGroups = await bpCourse.getAssignmentGroups();
                if (!bpAssignmentGroups) throw new Error("We couldn't get the BP assignment groups");
                console.log("BP Modules ", bpAssignmentGroups);

                for (const group of bpAssignmentGroups) {
                    if (group.name === "Assignments" && group.group_weight === 0) {
                        const deleteGroup = await fetchJson(
                            `/api/v1/courses/${bpCourse.id}/assignment_groups/${group.id}`,
                            {
                                fetchInit: {
                                    method: 'DELETE',
                                    body: formDataify({}),
                                }
                            }
                        );
                        if (deleteGroup.errors) {
                            alert("Failed to delete empty Assignments group in BP. You will need to remove it manually.");
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        setCloningBp(false);
    }

    async function finishMigration(migration: SavedMigration) {
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

        return <div>
        {!isDev && <Row><Col className={'alert alert-warning'}>This is not a DEV course</Col></Row>}
        {currentBp && <Row>
            <Col sm={3}>
                <Button
                    id={'archiveButton'}
                    onClick={onArchive}
                    disabled={isArchiveDisabled}
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
                    placeholder={TERM_NAME_PLACEHOLDER}
                />

            </Col>
            <Col>
                {!termName && <Alert>Term name not found in BP sections.</Alert>}

            </Col>
        </Row>}
        <hr/>
        {<>
            <Row><Col sm={3}>
                <Button
                    id={'newBpButton'}
                    onClick={onCloneIntoBp}
                    aria-label={'New BP'}
                    disabled={isNewBpDisabled}
                >Create New BP</Button>
            </Col>
                <Col sm={3}>
                    {currentBp?.isUndergrad && <Button
                        id={'academicIntegrityButton'}
                        onClick={() => academicIntegritySetup({ currentBp, setIsRunningIntegritySetup })}
                        disabled={isRunningIntegritySetup || !currentBp || isCloningBp}
                        aria-label={'Setup Academic Integrity in New BP'}
                        title="Set up the Academic Integrity content in the BP. This may take a while to complete. You can change tabs but closing or refreshing this tab may cause issues."
                    >{academicIntegrityText}</Button>
                    }
                </Col>
                <Col sm={5}>
                    {currentBp && activeMigrations.map(migration => <DevToBpMigrationBar
                        migration={migration}
                        onFinishMigration={finishMigration}
                        course={currentBp}/>)}
                </Col>
            </Row>
        </>}
    </div>
}