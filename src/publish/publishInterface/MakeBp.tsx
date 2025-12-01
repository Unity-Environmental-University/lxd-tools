import {createNewCourse, getCourseById, getCourseName} from "@/canvas/course";
import {Alert, Button, Col, FormControl, FormText, Row} from "react-bootstrap";
import {FormEvent, useEffect, useReducer, useState} from "react";
import {useEffectAsync} from "@/ui/utils";
import {
    getBlueprintsFromCode,
    lockBlueprint,
    sectionDataGenerator, setAsBlueprint
} from "@/canvas/course/blueprint";
import {bpify} from "@/admin";
import {migrationsForCourseGen, IMigrationData, startMigration} from "@/canvas/course/migration";
import {Course} from "@/canvas/course/Course";
import {listDispatcher} from "@/ui/reducerDispatchers";
import {
    loadCachedCourseMigrations,
    SavedMigration,
    cacheCourseMigrations,
    loadCachedMigrations
} from "@/canvas/course/migration/migrationCache";
import {DevToBpMigrationBar} from "./DevToBpMigrationBar";
import assert from "assert";
import {SectionData} from "@/canvas/courseTypes";
import dateFromTermName from "@/canvas/term/dateFromTermName";
import {Temporal} from "temporal-polyfill";
import {jsonRegex} from "ts-loader/dist/constants";
import {getSections} from "@canvas/course/getSections";
import {getTermNameFromSections} from "@canvas/course/getTermNameFromSections";
import {retireBlueprint} from "@canvas/course/retireBlueprint";
import {getModules} from "@/canvas-redux/modulesSlice";
import {fetchJson} from "@canvas/fetch/fetchJson";
import {formDataify, IModuleData, NotImplementedException} from "../../../../ueu_canvas";
import {renderAsyncGen} from "@canvas/canvasUtils";
import {moduleGenerator} from "@canvas/course/modules";
import {IModuleItemData} from "@canvas/canvasDataDefs";
import {IPageData} from "@canvas/content/pages/types";


export const TERM_NAME_PLACEHOLDER = 'Fill in term name here to archive.'

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
                        alert("An empty assignments group was created in the BP. Remove it in the Assignments tab of the BP.");
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

    async function academicIntegritySetup() {
        setIsRunningIntegritySetup(true);
        // Get BP
        const bp = currentBp;
        if (!bp) {
            alert("No BP found.");
            return;
        }

        const modules = await bp.getModules();
        if (!modules) {
            alert("No modules found in BP.");
            setIsRunningIntegritySetup(false);
            return;
        }

        // Check if academic integrity module exists, find instructor guide module
        for (const module of modules) {
            if (module.name === 'Academic Integrity') {
                // If academic integrity module already exists, alert the use and stop
                alert("Academic integrity module already exists in BP.");
                setIsRunningIntegritySetup(false);
                return;
            }
        }

        const assignmentGroups = await bp.getAssignmentGroups();
        let assignmentGroupId: number | null = null;

        console.log("Assignment Groups: ", JSON.stringify(assignmentGroups));

        for (const group of assignmentGroups) {
            if (group.name.toLocaleLowerCase().includes("assignment")) {
                assignmentGroupId = group.id;
                break;
            }
        }

        console.log("Integrity Assignment Group ID after for loop: ", assignmentGroupId);

        if (!assignmentGroupId) {
            assignmentGroupId = assignmentGroups[0]?.id || 0;
        }

        const academicIntegrityCourse = await getCourseById(7724480);
        const academicIntegrityModules = await academicIntegrityCourse.getModules();
        const academicIntegrityPages = await academicIntegrityCourse.getPages();
        const academicIntegrityModuleIds: number[] = [];
        let aiInstructorGuideModule: IModuleData | null = null;
        const aiInstructorGuideItemIds: number[] = [];
        const aiInstructorGuideItemUrls: Array<string | undefined> = [];

        if (!academicIntegrityCourse) {
            alert("Academic integrity course not found.");
            setIsRunningIntegritySetup(false);
            return;
        }

        for (const module of academicIntegrityModules) {
            let academicIntegrityModuleFound = false;
            let aiInstructorGuideModuleFound = false;

            if (module.name === 'Academic Integrity') {
                academicIntegrityModuleIds.push(module.id);
                academicIntegrityModuleFound = true;
            } else if (module.name.toLocaleLowerCase().includes("instructor guide resources")) {
                aiInstructorGuideModule = module;
                aiInstructorGuideModuleFound = true;
            }

            if(academicIntegrityModuleFound && aiInstructorGuideModuleFound) {
                break; // Exit loop early if both modules are found
            }
        }

        if(aiInstructorGuideModule && aiInstructorGuideModule.items) {
            for (const item of aiInstructorGuideModule.items) {
                aiInstructorGuideItemUrls.push(item.page_url);
                const page = academicIntegrityPages.find(p => p.rawData.url === item.page_url);
                if (page) aiInstructorGuideItemIds.push(page.rawData.page_id);
                console.log("Found AI Instructor Guide Page ID: ", page?.rawData.page_id);
            }
        }

        console.log("AI Instructor Guide Item IDs: ", aiInstructorGuideItemIds);

        if (!academicIntegrityModules) {
            alert("No modules found in academic integrity course.");
            setIsRunningIntegritySetup(false);
            return;
        }

        // Get module/pages from academic integrity course
        const academicIntegrityMigration = await startMigration(academicIntegrityCourse.id, bp.id,
            {
                fetchInit: {
                    body: formDataify({
                        migration_type: 'course_copy_importer',
                        settings: {
                            source_course_id: academicIntegrityCourse.id,
                            move_to_assignment_group_id: assignmentGroupId,
                        },
                        select: {
                            modules: academicIntegrityModuleIds,
                            pages: aiInstructorGuideItemIds,
                        }
                    })
                }
            });

        await waitForMigrationCompletion(bp.id, academicIntegrityMigration.id);

        if (academicIntegrityMigration.workflow_state === "failed") {
            alert("There was a problem in the migration process. Check the BP to make sure the modules imported correctly.");
            setIsRunningIntegritySetup(false);
            return;
        }

        // Create academic integrity section in BP
        const createSection = await fetchJson(
            `/api/v1/courses/${bp.id}/sections`,
            {
                fetchInit: {
                    method: 'POST',
                    body: formDataify({
                        course_section: {
                            name: 'Academic Integrity',
                        },
                        enable_sis_reactivation: true,
                    }),
                }
            });

        if (createSection.errors) {
            alert("Failed to create academic integrity section in BP.");
            setIsRunningIntegritySetup(false);
            return;
        }

        // Get the updated list of modules in the BP after the migration
        const updatedModulesGen = moduleGenerator(bp.id);
        const updatedModules: IModuleData[] = [];
        let bpAcademicIntegrityModule: IModuleData | undefined = undefined;
        let instructorResourcesModule: IModuleData | undefined = undefined;

        for await (const module of updatedModulesGen) {
            updatedModules.push(module);
            if (module.name === "Academic Integrity") {
                bpAcademicIntegrityModule = module;
            } else if (module.name.toLocaleLowerCase().includes("leave unpublished")) {
                instructorResourcesModule = module;
            }
        }

        if (!bpAcademicIntegrityModule) {
            alert("There was an error finding the Academic Integrity module in the BP after migration.");
            setIsRunningIntegritySetup(false);
            return;
        }

        if (!instructorResourcesModule) {
            alert("There was a problem finding the Instructor Resources module.");
            setIsRunningIntegritySetup(false);
            return;
        }

        // Hoping to delete from 445-462 once Canvas gets back to me, solving my import issue
        const updatedAssignmentGroups = await bp.getAssignmentGroups();

        for (const group of updatedAssignmentGroups) {
            if (group.name.toLocaleLowerCase().includes("imported")) {
                const deleteGroup = await fetchJson(
                    `/api/v1/courses/${bp.id}/assignment_groups/${group.id}`,
                    {
                        fetchInit: {
                            method: 'DELETE',
                            body: formDataify({}),
                        }
                    }
                );

                if (deleteGroup.errors) {
                    alert("Failed to delete imported assignment group in BP. You will need to remove it manually.");
                }
            }
        }

        const pages = await bp.getPages();
        console.log("All BP Pages: ", pages);
        console.log("AI Instructor Guide Item URLs: ", aiInstructorGuideItemUrls);
        const aiInstructorGuideItems = pages?.filter(page => aiInstructorGuideItemUrls.includes(page.rawData.url));

        console.log("aiInstructorGuideItems after filter: ", aiInstructorGuideItems);

        console.log("AI Instructor Guide Items in BP: ", aiInstructorGuideItems);

        // Put items into the instructor resources module
        let issueOccurred = false;

        for (const item of aiInstructorGuideItems ?? []) {
            const itemUrl = item.getItem("url");
            const unpublish = await fetchJson(
                `/api/v1/courses/${bp.id}/pages/${itemUrl}`,
                {
                    fetchInit: {
                        method: 'PUT',
                        body: formDataify({
                            wiki_page: {
                                published: false,
                            }
                        }),
                    }
                }
            )
            const addToModule = await fetchJson(
                `/api/v1/courses/${bp.id}/modules/${instructorResourcesModule.id}/items`,
                {
                    fetchInit: {
                        method: 'POST',
                        body: formDataify({
                            module_item: {
                                type: 'Page',
                                page_url: item.getItem("url"),
                            }
                        }),
                    }
                }
            );

            if (unpublish.errors || addToModule.errors) {
                issueOccurred = true;
            }
        }

        if (issueOccurred) {
            alert("There was an issue adding the Academic Integrity Instructor Guide pages to the Instructor Resources module. Please check the BP manually.");
        }

        // Set academic integrity module to only be assigned to people in the section
        const setModuleAssignment = await fetch(
            `/api/v1/courses/${bp.id}/modules/${bpAcademicIntegrityModule.id}/assignment_overrides`,
            {
                method: 'PUT',
                body: formDataify({
                    overrides: [{
                        title: 'Academic Integrity Section Override',
                        course_section_id: createSection.id,
                    }]
                }),
            }
        );

        if (!setModuleAssignment.ok) {
            alert("Failed to update academic integrity module assignment in BP. You will need to do this manually.");
        }

        //If we made it here, let the user know we've succeeded
        alert("Academic integrity setup complete!");
        setIsRunningIntegritySetup(false);
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
                        onClick={academicIntegritySetup}
                        disabled={isRunningIntegritySetup || !currentBp || isCloningBp}
                        aria-label={'Setup Academic Integrity in New BP'}
                        title="Set up the Academic Integrity content in the BP. This may take a while to complete. You can change tabs but closing or refreshing this tab may cause issues."
                    >{academicIntegrityText}</Button>
                    }
                </Col>
                <Col sm={5}>
                    {currentBp && activeMigrations.map(migration => <DevToBpMigrationBar
                        key={migration.id}
                        migration={migration}
                        onFinishMigration={finishMigration}
                        course={currentBp}/>)}
                </Col>
            </Row>
        </>}
    </div>
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