import {Course} from "../../canvas/index";
import React, {ChangeEvent, useState} from "react";
import {Temporal} from "temporal-polyfill";
import {useEffectAsync} from "../../ui/utils";
import {Button} from "react-bootstrap";
import DatePicker from "react-datepicker";

import {oldDateToPlainDate} from "../../canvas/canvasUtils";
import {SyllabusUpdateError, updatedDateSyllabusHtml} from "../../canvas/fixes/changeStartDate";
import {changeModuleLockDate} from "../../canvas/modules";

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
            const results = updatedDateSyllabusHtml(syllabusText, workingStartDate);
            if (syllabusText !== results.html) {
                await course.changeSyllabus(results.html);
                affectedItems = [...getSyllabusAffectedItemsRows(results)];
                const modules = await course.getModules();
                await changeModuleLockDate(course.id, modules[0], workingStartDate);
                if(workingStartDate != startDate) {
                    affectedItems.push(<>
                        <div className={'col-sm-6'}>Changed Lock Date</div>
                        <div className={'col-sm-6'}><a href={course.htmlContentUrl + '/modules'}>Modules Page</a></div>
                    </>)
                }

                if(!startDate) throw new StartDateNotSetError();

                await course.updateDueDates(startDate?.until(workingStartDate).days);
                setAffectedItems && setAffectedItems(affectedItems)
            } else {
                setUnaffectedItems && setUnaffectedItems([])
            }
            await refreshCourse();
            setStartDate(workingStartDate);

        } catch (error: any) {
            console.log(error);
            setFailedItems && setFailedItems([<div className={'ui-alert'}><h2>{error.toString()}</h2>
                <p>{error.stack}</p></div>]);

        }
        endLoading();
    }

    function getSyllabusAffectedItemsRows(results: { html: string; changedText: string[] }) {
        return results.changedText.map((changedText) => <>
            <div className={'col-sm-6'}><strong>Change:</strong>{changedText}</div>
            <div className={'col-sm-6'}><a href={course.htmlContentUrl + '/assignments/syllabus'}>Syllabus</a></div>
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
            <div className={'col-sm-4'}>Removes annotation placeholders on Learning Material pages</div>
        </div>
    </>
}

class StartDateNotSetError extends Error {
    name = "StartDateNotSetError"
};