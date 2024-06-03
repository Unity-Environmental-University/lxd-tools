import {Temporal} from "temporal-polyfill";
import {IModuleData} from "../canvasDataDefs";
import {findDateRange, oldDateToPlainDate} from "../../date";
import assert from "assert";
import {Assignment} from "../content/index";
import local = chrome.storage.local;

const DEFAULT_LOCALE = 'en-US';

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

export function getGradTermName(termStart:Temporal.PlainDate, locale=DEFAULT_LOCALE) {
    const month = termStart.toLocaleString(locale, { month: '2-digit'})
    const day = termStart.toLocaleString(locale, { day: '2-digit'})
    const year = termStart.toLocaleString(locale, { year: '2-digit'})

    return `DE8W${month}.${day}.${year}`;
}

export function getUgTermName(termStart:Temporal.PlainDate, locale=DEFAULT_LOCALE) {
    const year = termStart.toLocaleString(DEFAULT_LOCALE, { year: '2-digit'})
    const month = termStart.toLocaleString(DEFAULT_LOCALE, { month: 'short'})
    return `DE-${year}-${month}`;
}

export function getNewTermName(oldTermName:string, newTermStart:Temporal.PlainDate, locale= DEFAULT_LOCALE) {
    const termNameGrad = oldTermName.match(/DE8W\d\d\.\d\d\.\d\d/)
    if (termNameGrad) return getGradTermName(newTermStart)
    const termNameUg = oldTermName.match(/(DE(?:.HL|)-\d\d)-(\w+)\w{2}?/i);
    if (termNameUg) return getUgTermName(newTermStart);
    throw new MalformedSyllabusError(`Can't Recognize Term Name ${oldTermName}`)
}

export function updatedDateSyllabusHtml(html: string, newStartDate: Temporal.PlainDate, locale = DEFAULT_LOCALE) {
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

    const oldTermName = termNameEl.textContent || '';
    const oldDates = datesEl.textContent || '';
    const dateRange = findDateRange(datesEl.innerHTML, locale);
    if (!dateRange) throw new MalformedSyllabusError("Date range not found in syllabus");

    const courseDuration = dateRange.start.until(dateRange.end);
    const newEndDate = newStartDate.add(courseDuration);
    const newTermName = getNewTermName(oldTermName, newStartDate)
    
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
    return `${date.toLocaleString(DEFAULT_LOCALE, { month: 'long', day: 'numeric' })}`;
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
