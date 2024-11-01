import React, {ChangeEvent, useState} from "react";
import {Temporal} from "temporal-polyfill";
import {useEffectAsync} from "@/ui/utils";
import {Button} from "react-bootstrap";
import DatePicker from "react-datepicker";


import {
    getStartDateAssignments, MalformedSyllabusError,
    updatedDateSyllabusHtml
} from "@/canvas/course/changeStartDate";
import {changeModuleLockDate, moduleGenerator} from "@/canvas/course/modules";
import {oldDateToPlainDate} from "@/date";

import {Course} from "@/canvas/course/Course";
import {assignmentDataGen, updateAssignmentDueDates} from "@/canvas/content/assignments";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {BaseContentItem} from "@/canvas/content/BaseContentItem";
import {Discussion} from "@/canvas/content/discussions/Discussion";

import {IDiscussionData} from "@/canvas/content/discussions/types";
import {IModuleData} from "@/canvas/canvasDataDefs";
import {renderAsyncGen} from "@canvas/canvasUtils";

type UpdateStartDateProps = {
    setAffectedItems?: (elements: React.ReactElement[]) => any,
    setUnaffectedItems?: (elements: React.ReactElement[]) => any,
    setFailedItems?: (elements: React.ReactElement[]) => any,
    course: Course,
    refreshCourse: (force?: boolean) => Promise<void>,
    isDisabled: boolean,
    startLoading: () => void,
    endLoading: () => void
}
export function UpdateStartDate(
    {
        course,
        isDisabled,
        startLoading,
        endLoading,
        refreshCourse,
        setAffectedItems,
        setUnaffectedItems,
        setFailedItems
    }: UpdateStartDateProps) {

    const [startDate, setStartDate] = useState<Temporal.PlainDate | null>();
    const [workingStartDate, setWorkingStartDate] = useState<Temporal.PlainDate | null>();
    useEffectAsync(async () => {
        let date = await course.getStartDateFromModules();
        if (!date) date = getStartDateAssignments(await renderAsyncGen(assignmentDataGen(course.id)))

        setStartDate(date);
        setWorkingStartDate(date);
    }, [course]);


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
            affectedItems = [...affectedItems, ...affectedAssignments.map(ContentAffectedRow)]
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
            const syllabusChanges = await updateSyllabus(syllabusText, workingStartDate, course, startDate, modules);
            if (syllabusChanges) affectedItems.concat(syllabusChanges);


            setAffectedItems && setAffectedItems(affectedItems)
            await refreshCourse(true);
            setStartDate(workingStartDate);

        } catch (error: any) {
            console.log(error);
            setAffectedItems && setAffectedItems(affectedItems)
            setFailedItems && setFailedItems([<div className={'ui-alert'}><h2>{error.toString()}</h2>
                <p>{error.stack}</p></div>]);
            console.error(error);
        }
        endLoading();
    }


    function updateStartDateValue(inDate: Date) {
        setWorkingStartDate(oldDateToPlainDate(inDate));
    }


    return <>
        <div className={'row'}>
            <div className={'col-sm-4'}>
                <Button onClick={changeStartDate} disabled={isDisabled}>
                    Change Start Date
                </Button>
                <label>Current: {startDate?.toLocaleString('default', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })}</label></div>
            <div className={'col-sm-4'}>
                <DatePicker value={workingStartDate?.toLocaleString()} onChange={updateStartDateValue}/>
                <label>Target: {workingStartDate?.toLocaleString('default', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })}</label>
                {startDate && workingStartDate &&
                    <label>{'\u0394'} days: {startDate.until(workingStartDate).days}</label>}
            </div>
            <div className={'col-sm-4'}>Update dates of assignments, announcements, and on syllabus</div>
        </div>
    </>
}

class StartDateNotSetError extends Error {
    name = "StartDateNotSetError"
}

async function updateSyllabus(syllabusText: string, updateStartDate: Temporal.PlainDate, course: Course, startDate: Temporal.PlainDate | null, modules: IModuleData[]) {
    const affectedItems: React.ReactElement[] = [];
    const results = updatedDateSyllabusHtml(syllabusText, updateStartDate);
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

async function updateAssignmentDates(courseId: number, startDate: PlainDate, workingStartDate: PlainDate) {
    const assignments = await renderAsyncGen(assignmentDataGen(courseId))
    const affectedItems = [];
    const startOfFirstWeek = getStartDateAssignments(assignments);
    let contentDateOffset = startDate.until(workingStartDate).days;
    const startOfFirstWeekOffset = startOfFirstWeek.until(workingStartDate).days;

    if (contentDateOffset != startOfFirstWeekOffset) {
        affectedItems.push(<div>Note: start date mismatch. Offsetting content based on </div>)
        contentDateOffset = startDate.until(startOfFirstWeek).days;
    }
    return await updateAssignmentDueDates(contentDateOffset, assignments, {courseId});
}

export function SyllabusAffectedItemsRows(courseId: number, results: { html: string; changedText: string[] }) {
    return results.changedText.map((changedText) => <>
            <div className={'col-sm-6'}><strong>Change:</strong>{changedText}</div>
            <div className={'col-sm-6'}><a href={`/api/v1/courses/${courseId}/assignments/syllabus`}
                                           target={"_blank"}>Syllabus</a></div>
        </>
    );
}

export function ContentAffectedRow(item: BaseContentItem) {
    return <>
        <div className={'col-sm-6'}><a href={item.htmlContentUrl} target={"_blank"}>{item.name}</a></div>
        <div className={'col-sm-6'}>{item.dueAt?.toString()}</div>
    </>


}
