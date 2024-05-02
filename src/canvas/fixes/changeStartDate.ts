import {Temporal} from "temporal-polyfill";
import {IModuleData} from "../canvasDataDefs";
import {findDateRange, oldDateToPlainDate} from "../../date";
import assert from "assert";
import {Assignment} from "../content";

export function getCurrentStartDate(modules: IModuleData[]) {
    if (modules.length == 0) throw new NoOverviewModuleFoundError();
    const overviewModule = modules[0];
    const lockDateString = overviewModule.unlock_at;
    const oldDate = new Date(lockDateString);
    return oldDateToPlainDate(oldDate);
}

export function getStartDateAssignments(assignments:Assignment[]) {
    const sorted = assignments
        .filter((assignment) => assignment.dueAt)
        .toSorted((a, b) =>
        {

            if(a.dueAt && b.dueAt) {
                return oldDateToPlainDate(b.dueAt).until(oldDateToPlainDate(a.dueAt)).days;
            }
            if(a.dueAt) return -1;
            if(b.dueAt) return 1;
            return 0;
        }
    );
    console.log(sorted);
    if (sorted.length == 0) throw new NoAssignmentsWithDueDatesError();
    const firstAssignmentDue = sorted[0].dueAt;
    assert(firstAssignmentDue, "It should be literally impossible for this to happen with current type checking.")

    //Set to monday of that week.
    const plainDateDue = oldDateToPlainDate(firstAssignmentDue);
    const dayOfWeekOffset = 1 - plainDateDue.dayOfWeek;
    return plainDateDue.add({days: dayOfWeekOffset});
}

export function updatedDateSyllabusHtml(html: string, newStartDate: Temporal.PlainDate, locale = 'en-US') {
    const syllabusBody = document.createElement('div');
    syllabusBody.innerHTML = html;
    const syllabusCalloutBox = syllabusBody.querySelector('div.cbt-callout-box');
    if(!syllabusCalloutBox) throw new MalformedSyllabusError("Can't find syllabus callout box");

    let paras = Array.from(syllabusCalloutBox.querySelectorAll('p'));
    paras = paras.filter((para) => para.querySelector('strong'));
    if (paras.length < 5) throw new MalformedSyllabusError(`Missing syllabus headers\n${paras}`);

    const [
        _courseNameEl,
        termNameEl,
        datesEl,
        _instructorNameEl,
        _instructorContactInfoEl,
        _creditsEl
    ] = paras;

    const changedText: string[] = [];

    const oldTermName = termNameEl.innerText;
    const oldDates = datesEl.innerText;
    const termName = termNameEl.innerHTML.match(/(DE(?:.HL|)-\d\d)-(\w+)\w{2}?/i);
    const dateRange = findDateRange(datesEl.innerHTML, locale);
    if (!dateRange) throw new MalformedSyllabusError("Date range not found in syllabus");
    if (!termName) throw new MalformedSyllabusError("Term not found in syllabus");

    const courseDuration = dateRange.start.until(dateRange.end);
    const newEndDate = newStartDate.add(courseDuration);
    const newTermName =`${termName[1]}-${newStartDate.toLocaleString(locale, {month:'short'})}`;
    
    const dateRangeText = `${dateToSyllabusString(newStartDate)} - ${dateToSyllabusString(newEndDate)}`;

    termNameEl.innerHTML = `<p><strong>${syllabusHeaderName(termNameEl)}:</strong> ${newTermName}</p>`;
    datesEl.innerHTML = `<p><strong>${syllabusHeaderName(datesEl)}:</strong> ${dateRangeText}</p>`;

    changedText.push(`${oldTermName} -> ${termNameEl.innerText}`)
    changedText.push(`${oldDates} -> ${datesEl.innerText}`)

    const output = {
        html : syllabusBody.innerHTML,
        changedText,
    }
    syllabusBody.remove();
    return output;
}

function dateToSyllabusString(date:Temporal.PlainDate) {
    return `${date.toLocaleString('en-US', { month: 'long', day: 'numeric' })}`;
}

function syllabusHeaderName(el:HTMLElement) {
    const header = el.querySelector('strong');
    if(!header) return null;
    const html = header.innerHTML;
    return html.replace(/:$/, '')
}

export class SyllabusUpdateError extends Error {
    public name = "SyllabusUpdateError";
}
export class NoOverviewModuleFoundError extends Error {
    public name = "NoOverviewModuleFoundError"
}

export class MalformedSyllabusError extends Error {
    public name="MalformedSyllabusError"
}

export class NoAssignmentsWithDueDatesError extends Error {
    public name = "NoAssignmentsWithDueDatesError"
}
