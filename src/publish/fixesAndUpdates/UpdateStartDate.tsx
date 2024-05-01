import {BaseContentItem, Course, Discussion} from "../../canvas/index";
import React, {ChangeEvent, useState} from "react";
import {Temporal} from "temporal-polyfill";
import {useEffectAsync} from "../../ui/utils";
import {Button} from "react-bootstrap";
import DatePicker from "react-datepicker";



import {getPagedDataGenerator} from "../../canvas/canvasUtils";
import {
    getStartDateAssignments,
    SyllabusUpdateError,
    updatedDateSyllabusHtml
} from "../../canvas/fixes/changeStartDate";
import {changeModuleLockDate} from "../../canvas/modules";
import {IDiscussionData} from "../../canvas/canvasDataDefs";
import {oldDateToPlainDate} from "../../date";

type UpdateStartDateProps = {
    setAffectedItems?: (elements: React.ReactElement[]) => any,
    setUnaffectedItems?: (elements: React.ReactElement[]) => any,
    setFailedItems?: (elements: React.ReactElement[]) => any,
    course: Course,
    refreshCourse: () => Promise<void>,
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
        const date = await course.getStartDateFromModules();
        setStartDate(date);
        setWorkingStartDate(date);
    }, [course]);


    async function changeStartDate() {
        startLoading();
        if (!workingStartDate) throw new StartDateNotSetError();
        const syllabusText = await course.getSyllabus();
        let affectedItems: React.ReactElement[] = [];

        try {

            if (syllabusText) {
                if (!startDate) throw new StartDateNotSetError();

                const syllabusChanges = await updateSyllabus(syllabusText, workingStartDate);
                if (syllabusChanges) affectedItems.concat(syllabusChanges);

                let startOfFirstWeek = getStartDateAssignments(await course.getAssignments());
                console.log(startOfFirstWeek.toString());
                let contentDateOffset = startDate.until(workingStartDate).days;
                let startOfFirstWeekOffset = startOfFirstWeek.until(workingStartDate).days;
                console.log(startOfFirstWeekOffset)
                if (contentDateOffset != startOfFirstWeekOffset) {
                    affectedItems.push(<div>Note: start date mismatch. Using first week from assignments to determine
                        content dates.</div>)
                    contentDateOffset = startOfFirstWeekOffset;
                }
                const affectedContent = await course.updateDueDates(contentDateOffset);
                for (let contentItem of affectedContent) {
                    affectedItems.push(getContentAffectedItemRow(contentItem));
                }


                const announcementGenerator = getPagedDataGenerator<IDiscussionData>(`/api/v1/courses/${course.id}/discussion_topics`, {
                    queryParams: {
                        only_announcements: true
                    }
                });

                for await (let value of announcementGenerator) {
                    let discussion = new Discussion(value, course);
                    console.log(contentDateOffset);
                    await discussion.offsetPublishDelay(contentDateOffset);
                    affectedItems.push(getContentAffectedItemRow(discussion))
                }

                setAffectedItems && setAffectedItems(affectedItems)
            } else {
                setUnaffectedItems && setUnaffectedItems([])
            }
            await refreshCourse();
            setStartDate(workingStartDate);

        } catch (error: any) {
            console.log(error);
            setAffectedItems && setAffectedItems(affectedItems)
            setFailedItems && setFailedItems([<div className={'ui-alert'}><h2>{error.toString()}</h2>
                <p>{error.stack}</p></div>]);

        }
        endLoading();
    }

    async function updateSyllabus(syllabusText: string, updateStartDate: Temporal.PlainDate) {
        const affectedItems: React.ReactElement[] = [];
        const results = updatedDateSyllabusHtml(syllabusText, updateStartDate);
        if (syllabusText !== results.html) {
            await course.changeSyllabus(results.html);
            for (let row of getSyllabusAffectedItemsRows(results)) {

            }
            const modules = await course.getModules();
            await changeModuleLockDate(course.id, modules[0], updateStartDate);
            if (updateStartDate != startDate) {
                affectedItems.push(<>
                    <div className={'col-sm-6'}>Changed Lock Date</div>
                    <div className={'col-sm-6'}><a href={course.htmlContentUrl + '/modules'}>Modules Page</a></div>
                </>)
            }
            return affectedItems;

        }
    }

    function getContentAffectedItemRow(item: BaseContentItem) {
        return <>
            <div className={'col-sm-6'}><a href={item.htmlContentUrl} target={"_blank"}>{item.name}</a></div>
            <div className={'col-sm-6'}>{item.dueAt?.toString()}</div>
        </>


    }


    function getSyllabusAffectedItemsRows(results: { html: string; changedText: string[] }) {
        return results.changedText.map((changedText) => <>
                <div className={'col-sm-6'}><strong>Change:</strong>{changedText}</div>
                <div className={'col-sm-6'}><a href={course.htmlContentUrl + '/assignments/syllabus'}
                                               target={"_blank"}>Syllabus</a></div>
            </>
        );
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
};