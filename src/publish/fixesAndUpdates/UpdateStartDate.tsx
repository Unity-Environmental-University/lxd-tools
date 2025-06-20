import React, {useState} from "react";
import Alert from 'react-bootstrap/Alert';
import {Temporal} from "temporal-polyfill";
import {Button} from "react-bootstrap";
import DatePicker from "react-datepicker";


import {
    getModuleUnlockStartDate,
    getStartDateAssignments, getStartDateFromSyllabus, MalformedSyllabusError,
    updatedDateSyllabusHtml
} from "@canvas/course/changeStartDate";
import {changeModuleLockDate, moduleGenerator} from "@canvas/course/modules";
import {oldDateToPlainDate} from "@/date";

import {Course} from "@canvas/course/Course";
import {assignmentDataGen, updateAssignmentDueDates} from "@canvas/content/assignments";
import {getPagedDataGenerator} from "@canvas/fetch/getPagedDataGenerator";
import {BaseContentItem} from "@canvas/content/BaseContentItem";
import {Discussion} from "@canvas/content/discussions/Discussion";

import {IModuleData} from "@canvas/canvasDataDefs";
import {renderAsyncGen} from "@canvas/canvasUtils";


import {IAssignmentData, IDiscussionData} from "@canvas/content/types";
import {Assignment} from "@canvas/content/assignments/Assignment";

type UpdateStartDateProps = {
    setAffectedItems?: (elements: React.ReactElement[]) => any,
    setUnaffectedItems?: (elements: React.ReactElement[]) => any,
    setFailedItems?: (elements: React.ReactElement[]) => any,
    course: Course,
    refreshCourse: (force?: boolean) => Promise<void>,
    isDisabled: boolean,
    startLoading: () => void,
    endLoading: () => void
    setStartDateOutcome?: (outcome: string) => void
}
export function UpdateStartDate(
    {
        course,
        isDisabled,
        startLoading,
        endLoading,
        refreshCourse,
        setAffectedItems,
        setFailedItems,
        setStartDateOutcome,
    }: UpdateStartDateProps) {

    const [startDate, setStartDate] = useState<Temporal.PlainDate | null>();
    const [workingStartDate, setWorkingStartDate] = useState<Temporal.PlainDate | null>();
    const [modules, setModules] = useState<IModuleData[]|undefined>();
    const [syllabusText, setSyllabusText] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<IAssignmentData[] | undefined>();
    const [error, setError] = useState<string | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const [syllabusStartDate, setSyllabusStartDate] = useState<Temporal.PlainDate | null>(null);
    const [moduleStartDate, setModuleStartDate] = useState<Temporal.PlainDate | null>(null);
    const [assignmentsStartDate, setAssignmentsStartDate] = useState<Temporal.PlainDate | null>(null);

    /**
     * This effect runs once when the component mounts to load the initial start dates.
     */
    const handleShowChangeStartDate = async () => {
        setShowStartDatePicker(true); // Show UI immediately
        setLoading(true);
        await loadStartDates();       // Load your data here
        setLoading(false);
    };
    
    /**
     * This function loads the start dates for assignments, syllabus, and modules.
     * @returns {Promise<void>}
     */
    async function loadStartDates() {
        const assignmentData = await renderAsyncGen(assignmentDataGen(course.id));

        //Make async call to get assignments, syllabus, and modules all at once
        // This is to avoid multiple calls to the server and to ensure that all data is fetched
        const [assignments, syllabusText, modules] = await Promise.all([
            assignmentData,
            course.getSyllabus(),
            renderAsyncGen(moduleGenerator(course.id)),
        ]);

        // Assignments
        const localAssignments = assignments ?? assignmentData;
        if(assignments === undefined) setAssignments(localAssignments);

        const _assignmentsStartDate = getStartDateAssignments(assignmentData);
        console.log("Assignment Start Date", _assignmentsStartDate.toLocaleString());
        if (!assignmentsStartDate?.equals(_assignmentsStartDate)) setAssignmentsStartDate(_assignmentsStartDate);
        const errors: string[] = [];

        // Syllabus
        const localSyllabusText = syllabusText ?? await course.getSyllabus();
        if(!syllabusText) {setSyllabusText(localSyllabusText)}

        const _syllabusStartDate = getStartDateFromSyllabus(localSyllabusText);
        console.log("Syllabus Start Date", _syllabusStartDate.toLocaleString());
        if (!syllabusStartDate?.equals(_syllabusStartDate)) setSyllabusStartDate(_syllabusStartDate);

        // Module
        const localModules = modules ?? await renderAsyncGen(moduleGenerator(course.id));
        if(modules === undefined) setModules(localModules);
        const _moduleStartDate = getModuleUnlockStartDate(localModules);
        console.log("Module Start Date", _moduleStartDate?.toLocaleString());
        if (moduleStartDate && _moduleStartDate && !moduleStartDate?.equals(_moduleStartDate)) setModuleStartDate(_moduleStartDate);

        if(!_moduleStartDate || _assignmentsStartDate.until(_moduleStartDate).days != 0) errors.push("Assignment start date mismatch");
        if(_syllabusStartDate.until(_assignmentsStartDate).days != 0) errors.push("Syllabus start date mismatch");
        if(_moduleStartDate?.until(_syllabusStartDate).days != 0) errors.push("Module start date mismatch");
        if(errors.length > 0) {

            const errorString = "Start date mismatch: Syllabus: " + _syllabusStartDate.toLocaleString() +
                ", Module: " + _moduleStartDate?.toLocaleString() + ", Assignments: " + _assignmentsStartDate.toLocaleString();
            setError(errorString)
            setStartDateOutcome?.(errorString);
            return;
        }

        console.log("Start Date", _assignmentsStartDate?.toLocaleString());
        setStartDate(_assignmentsStartDate);
        setWorkingStartDate(_assignmentsStartDate);
        setStartDateOutcome?.("success");
    }

    /**
     * This function is called when the user clicks the "Change Start Date" button.
     * It updates the start date of the course, assignments, announcements, and syllabus.
     */
    async function changeStartDate() {
        startLoading();
        if (!workingStartDate) throw new StartDateNotSetError();
        const syllabusText = await course.getSyllabus();
        let affectedItems: React.ReactElement[] = [];

        try {
            if (!startDate) throw new StartDateNotSetError();
            const modules = await renderAsyncGen(moduleGenerator(course.id))
            await changeModuleLockDate(course.id, modules[0], workingStartDate);


            const affectedAssignments = await updateAssignmentDates(course.id, startDate, workingStartDate);
            affectedItems = [...affectedItems, ...affectedAssignments
                .map(data => new Assignment(data, course.id))
                .map(ContentAffectedRow)
            ]
            const contentDateOffset = startDate.until(workingStartDate).days;

            const announcementGenerator = getPagedDataGenerator<IDiscussionData>(`/api/v1/courses/${course.id}/discussion_topics`, {
                queryParams: {
                    only_announcements: true
                }
            });

            for await (const value of announcementGenerator) {
                const discussion = new Discussion(value, course.id);
                console.log(contentDateOffset);
                await discussion.offsetPublishDelay(contentDateOffset);
                affectedItems.push(ContentAffectedRow(discussion))
            }

            if (!syllabusText) throw new MalformedSyllabusError();
            const syllabusChanges = await updateSyllabus(syllabusText, workingStartDate, course, startDate);
            if (syllabusChanges) affectedItems.concat(syllabusChanges);


            setAffectedItems?.(affectedItems)
            await refreshCourse(true);
            setStartDate(workingStartDate);

        } catch (error: any) {
            console.log(error);
            setAffectedItems?.(affectedItems)
            setFailedItems?.([<Alert variant="danger"><h2>{error.toString()}</h2>
                <p>{error.stack}</p></Alert>]);
            console.error(error);
        }
        endLoading();
    }

    /**
     * This function updates the working start date when the user selects a new date in the date picker.
     * @param inDate The date selected by the user in the date picker.
     */
    function updateStartDateValue(inDate: Date|null) {
        if(inDate) setWorkingStartDate(oldDateToPlainDate(inDate));
    }

    /**
     * This variable determines whether the "Change Start Date" button should be disabled.
     */
    const isChangeStartDateDisabled = isDisabled
        || !course || !course.id || !workingStartDate
        || (startDate && workingStartDate.equals(startDate))
        || startDate === null || error !== null;


    return <>
        <div className={'row'}>
            {error && <Alert variant="danger"><h2>{error}</h2></Alert>}
        </div>
            <Button 
                onClick={handleShowChangeStartDate}
                disabled={loading}>
                { loading ? 'Loading Components...' : 'Show Change Start Date'}
            </Button>
        {workingStartDate && showStartDatePicker && <div className={'row'}>

            <div className={'col-sm-4'}>
                <Button onClick={changeStartDate} disabled={isChangeStartDateDisabled}>
                    Change Start Date
                </Button>
                <div>Update dates of assignments, announcements, and on syllabus</div>
            </div>
            <div className={'col-sm-4'}>
                <DatePicker value={workingStartDate?.toLocaleString()} onChange={updateStartDateValue}/>
                <label>Current: {startDate?.toLocaleString('default', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })}</label>
                <label>Target: {workingStartDate?.toLocaleString('default', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })}</label>
                {startDate && workingStartDate &&
                    <label>{'\u0394'} days: {startDate.until(workingStartDate).days}</label>}
            </div>
        </div>}
    </>
}

/**
 * This error is thrown when the start date is not set.
 * It is used to indicate that the user must select a start date before proceeding.
 */
class StartDateNotSetError extends Error {
    name = "StartDateNotSetError"
}

/**
 * A function that updates the syllabus with the new start date.
 * It modifies the syllabus HTML to reflect the new start date and returns a list of affected items
 * @param syllabusText The current syllabus text that is to be updated
 * @param updateStartDate The new start date to be applied to the syllabus
 * @param course The course object that contains the syllabus that will be updated
 * @param startDate The original start date of the course, used to determine if the syllabus has changed
 * @returns a list of affected items that were changed in the syllabus
 */
async function updateSyllabus(syllabusText: string, updateStartDate: Temporal.PlainDate, course: Course, startDate: Temporal.PlainDate | null) {
    const affectedItems: React.ReactElement[] = [];
    const [courseNum] = course.courseCode?.match(/\d{3}/ig) ?? [""];
    const isGrad = parseInt(courseNum) >= 500;
    const results = updatedDateSyllabusHtml(syllabusText, updateStartDate, isGrad);
    if (syllabusText !== results.html) {
        await course.changeSyllabus(results.html);
        if (updateStartDate != startDate) {
            affectedItems.push(<>
                <div className={'col-sm-6'}>Changed Lock Date</div>
                <div className={'col-sm-6'}><a href={course.htmlContentUrl + '/modules'}>Modules Page</a></div>
            </>)
        }
        return affectedItems;
    }
}

type PlainDate = Temporal.PlainDate;

/**
 * A function that updates the assignment due dates based on the new start date.
 * It calculates the offset between the new start date and the working start date
 * @param courseId The ID of the course for which assignments are being updated
 * @param startDate The new start date to be applied to the assignments
 * @param workingStartDate The original start date of the course, used to determine the offset
 * @returns A promise that resolves to the updated assignments
 */
async function updateAssignmentDates(courseId: number, startDate: PlainDate, workingStartDate: PlainDate) {
    const assignments = await renderAsyncGen(assignmentDataGen(courseId))
    const contentDateOffset = startDate.until(workingStartDate).days;
    return await updateAssignmentDueDates(contentDateOffset, assignments, {courseId});
}

/**
 * A function that generates rows for the affected items in the syllabus.
 * It creates a list of React elements that represent the changes made to the syllabus.
 * @param courseId The ID of the course for which the syllabus is being updated
 * @param results The results of the syllabus update, containing the HTML and the changed text
 * @param results.html The updated HTML content of the syllabus
 * @param results.changedText An array of strings representing the changes made to the syllabus
 * @returns 
 */
export function SyllabusAffectedItemsRows(courseId: number, results: { html: string; changedText: string[] }) {
    return results.changedText.map((changedText) => <>
            <div className={'col-sm-6'}><strong>Change:</strong>{changedText}</div>
            <div className={'col-sm-6'}><a href={`/api/v1/courses/${courseId}/assignments/syllabus`}
                                           target={"_blank"}>Syllabus</a></div>
        </>
    );
}

/**
 * A function that generates a row for an item affected by the start date change.
 * It displays the name and due date of the item, such as an assignment or discussion.
 * @param item An item that is affected by the start date change, such as an assignment or discussion.
 * @returns A React element that displays the name and due date of the affected item.
 */
export function ContentAffectedRow(item: BaseContentItem) {
    return <>
        <div className={'col-sm-6'}><a href={item.htmlContentUrl} target={"_blank"}>{item.name}</a></div>
        <div className={'col-sm-6'}>{item.dueAt?.toString()}</div>
    </>


}
