import React, {useEffect, useState} from "react";
import {useEffectAsync} from "../../ui/utils";
import {Button} from "react-bootstrap";
import Modal from "../../ui/widgets/Modal/index";
import {fixLmAnnotations} from "../../canvas/fixes/annotations";
import assert from "assert";
import {UpdateStartDate} from "./UpdateStartDate";
import {CourseValidator} from "./CourseValidator";
import {Course} from "../../canvas/course/Course";
import {Page} from "@/canvas/content/pages/Page";
import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";

export type CourseUpdateInterfaceProps = {
    course?: Course,
    parentCourse?: Course,
    onChangeMode?: (mode:InterfaceMode) => any,
    allValidations: CourseValidation<Course, any, any>[],
    refreshCourse: () => Promise<void>
}

export class MismatchedUnloadError extends Error {
    public name = "Mismatched Unload Error"
}

export type InterfaceMode = 'fix' | 'unitTest'



export function CourseUpdateInterface({
    course,
    refreshCourse,
    allValidations,
    onChangeMode,
}: CourseUpdateInterfaceProps) {

    const [validations, setValidations] = useState<CourseValidation<Course, any, any>[]>([]);
    const [show, setShow] = useState(false)
    const [buttonText, setButtonText] = useState('Content Fixes');
    const [affectedItems, setAffectedItems] = useState<React.ReactElement[]>([])
    const [_, setUnaffectedItems] = useState<React.ReactElement[]>([])
    const [failedItems, setFailedItems] = useState<React.ReactElement[]>([])
    const [deannotatingCount, setLoadingCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<InterfaceMode>('fix');
    const [startDateSetMode, setStartDateSetMode] = useState(false);
    const [batchingValidations, setBatchingValidations] = useState(false);
    const [validationsFinished, setValidationsFinished] = useState(false);

    const runValidationsDisabled = !course || isRemovingAnnotations() || batchingValidations;

    /**
     * This function batches validations over time, allowing for a smoother UI experience
     * by processing a limited number of validations at a time with a delay in between.
     * @param inValidations The array of validations to process
     * @param batchSize The number of validations to process in each batch. Defaults to 10.
     * @param delay The delay in seconds between each batch processing. If not specified, defaults to 2 seconds.
     */
    const batchValidationsOverTime = async (inValidations: CourseValidation<Course, any, any>[], batchSize:number = 10, delay=2) => {
        let localValidations = [...validations];
        inValidations = inValidations.filter(courseSpecificTestFilter);

        for(let i = 0; i < inValidations.length; i+= batchSize) {
            const batch = inValidations.slice(i, i + batchSize);
            localValidations = [...localValidations, ...batch];
            setValidations(localValidations);

            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }
    }

    /**
     * This function is designed to be called when the user clicks the "Run Validations"
     * @returns  A function that runs all validations in batches over time.
     */
    const runValidations = () => async () => {
        if(batchingValidations) return;
        setValidationsFinished(false);
        setBatchingValidations(true);
        await batchValidationsOverTime(allValidations);
        setBatchingValidations(false);
        setValidationsFinished(true);
        await refreshCourse();
    }

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onChangeMode && onChangeMode(mode)
    }, [mode]);

    /**
     * This function filters validations based on the course code.
     * @param validation  The validation to filter by course code
     * @returns Boolean indicating whether the validation applies to the current course.
     * If the validation has no course codes specified, it returns true.
     */
    const courseSpecificTestFilter = (validation: CourseValidation<Course, any, any>) => {
        if (!validation.courseCodes) return true;
        for (const code of validation.courseCodes) {
            if (course?.parsedCourseCode?.toUpperCase().includes(code.toLocaleUpperCase('en-US'))) {
                return true;
            }
        }
        return false;
    }

    useEffectAsync(async () => {
        if (!course) return;

        if (course.isDev) {
            setButtonText('DEV Content Changes/Fixes')
        } else if (course.isBlueprint()) {
            setButtonText('BP Content Fixes')
        } else {
            setButtonText("Can Only Fix from BP or DEV")
        }
        }, [course]);

    /**
     * This function starts the loading process for the course update interface.
     * It initializes the loading count, clears the lists of affected, unaffected, and failed items.
     * increment and decrement is loading just in case we end up setting it asynchronously somehow.
     */
    function startLoading() {
        setLoadingCount(1);
        setFailedItems([]);
        setAffectedItems([]);
        setUnaffectedItems([]);
    }

    /**
     * This function checks if the course update interface is disabled.
     * It returns true if the course is not defined or if the course is neither a blueprint or a development course.
     * @returns  Boolean indicating whether the course update interface is disabled.
     */
    function isDisabled() {
        if(!course) return true;
        return !(course.isBlueprint() || course.isDev);
    }

    /**
     * This function ends the loading process for the course update interface.
     */
    function endLoading() {
        setLoadingCount(0);
        console.log(deannotatingCount, '-');
        if (deannotatingCount < 0) throw new MismatchedUnloadError();
    }

    /**
     * This function increments the deannotating count, which is used to track the number of ongoing annotation removals.
     */
    function isRemovingAnnotations() {
        return deannotatingCount > 0;
    }

    /**
     * This function removes Learning Material annotations from the course.
     */
    async function removeLmAnnotations() {
        assert(course);
        startLoading();

        function pageToLink(page: Page) {
            return <a className="course-link" target="_blank" href={page.htmlContentUrl}>{page.name}</a>
        }

        const results = await fixLmAnnotations(course);
        setAffectedItems(results.fixedPages.map(pageToLink));
        setUnaffectedItems(results.unchangedPages.map(pageToLink));
        setFailedItems(results.failedPages.map(pageToLink));
        endLoading();
    }

    /**
     * This function generates rows of links for the course update interface.
     * @param links An array of React elements representing links to course content.
     * @param className A CSS class name to apply to each row of links, defaulting to 'lxd-cu'.
     * @returns An array of React elements, each representing a row of links.
     */
    function urlRows(links: React.ReactElement[], className = 'lxd-cu') {
        return links.map((link, i) =>
            <div key={i} className={['row', className].join(' ')}>
                {link}
            </div>)
    }

    /**
     * A function that sets the outcome of the start date update operation.
     * If the outcome is 'success', it sets the start date set mode to true.
     * @param outcome  The outcome of the start date update operation.
     */
    function setStartDateOutcome(outcome: string) {
        if (outcome === 'success') {
            setStartDateSetMode(true);
        } else {
            setError(outcome);
        }
    }

    // This is the styling of the course update interface
    function FixesMode({course}: { course: Course }) {
        return <>
            <h2>Content Fixes for {course.name}</h2>
            {course.isBlueprint() && <RemoveAnnotationsSection/>}

            <UpdateStartDate
                setAffectedItems={setAffectedItems}
                setUnaffectedItems={setUnaffectedItems}
                setFailedItems={setFailedItems}
                refreshCourse={refreshCourse}
                course={course}
                setStartDateOutcome={setStartDateOutcome}
                isDisabled={deannotatingCount > 0}
                startLoading={startLoading}
                endLoading={endLoading}
            />
            <hr/>

            <div className="d-flex align-items-center gap-2">
                <Button onClick={runValidations()} disabled={runValidationsDisabled}>{batchingValidations ? 'Loading Validations...' : 'Run Validations'}</Button>
                {error && <div className={'alert alert-danger mb-0 py-2 px-2'}>Error running validations: {error}</div>}
                {validationsFinished && <div className={'alert alert-success mb-0 py-2 px-2'}>Validations Finished!</div>}
            </div>
            {affectedItems.length > 0 && <h3>Fixes Succeeded</h3>}
            {urlRows(affectedItems, 'lxd-cu-success')}
            {failedItems.length > 0 && <h3>Fix is Broken, Content Unchanged</h3>}
            {urlRows(failedItems, 'lxd-cu-fail')}
        </>
    }

    /**
     * This function renders a section for removing annotations from Learning Material pages.
     * It is only displayed if the course is a blueprint course.
     * @returns A React element representing the section for removing annotations.
     */
    function RemoveAnnotationsSection() {
        return (course?.isBlueprint() && <div className={'row'}>
            <div className={'col-sm-4'}>
                <Button onClick={removeLmAnnotations} disabled={deannotatingCount > 0}>
                    Remove Annotation Placeholder
                </Button>
            </div>
            <div className={'col-sm-8'}>Removes annotation placeholders on Learning Material pages</div>
        </div>)
    }

    return (course && <>
        <Button disabled={isDisabled()} role={'button'} className={"ui-button"} onClick={(e) => setShow(true)}
        >{buttonText}</Button>
        <Modal isOpen={show} requestClose={() => setShow(false)} canClose={!deannotatingCount}>
            <div className={'d-flex justify-content-end'}>
                {mode === 'fix' && <Button onClick={() => setMode("unitTest")}>Show All Tests</Button>}
                {mode === 'unitTest' && <Button onClick={() => setMode("fix")}>Hide Successful Tests</Button>}
            </div>
            {mode === 'fix' && <FixesMode course={course}></FixesMode>}
            {['fix', 'unitTest'].includes(mode) && <CourseValidator
                showOnlyFailures={mode !== 'unitTest'}
                course={course}
                refreshCourse={refreshCourse}
                tests={validations}
            />}
        </Modal>
    </>)
}

