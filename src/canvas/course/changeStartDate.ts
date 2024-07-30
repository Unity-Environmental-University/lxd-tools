import {Temporal} from "temporal-polyfill";
import {IModuleData} from "../canvasDataDefs";
import {findDateRange, oldDateToPlainDate} from "../../date";
import assert from "assert";
import local = chrome.storage.local;

import {Assignment} from "@/canvas/content/assignments/Assignment";
import {IAssignmentData} from "@/canvas/content/assignments/types";
import {AssignmentKind} from "@/canvas/content/assignments/AssignmentKind";

const DEFAULT_LOCALE = 'en-US';

export function getModuleUnlockStartDate(modules: IModuleData[]) {
    if (modules.length == 0) throw new NoOverviewModuleFoundError();
    const overviewModule = modules[0];
    const unlockDateString = overviewModule.unlock_at;
    if(!unlockDateString) return null;
    const oldDate = new Date(unlockDateString);
    return oldDateToPlainDate(oldDate);
}

export function sortAssignmentsByDueDate(assignments:Assignment[]|IAssignmentData[]) {
    return assignments
        .toSorted((a, b) =>
        {
            a = a instanceof Assignment ? a.rawData : a;
            b = b instanceof Assignment ? b.rawData : b;


            if(a.due_at && b.due_at) {

                return oldDateToPlainDate(new Date(b.due_at)).until(oldDateToPlainDate(new Date(a.due_at))).days;
            }
            if(a.due_at) return -1;
            if(b.due_at) return 1;
            return 0;
        }
    );

}

export function getStartDateAssignments(assignments:Assignment[]|IAssignmentData[]) {
    const sorted = sortAssignmentsByDueDate(assignments).map(a => a.rawData ?? a).filter(a => a.due_at);
    if (sorted.length == 0) throw new NoAssignmentsWithDueDatesError();
    const firstAssignmentDue = new Date(sorted[0].due_at);

    //Set to monday of that week.
    const plainDateDue = oldDateToPlainDate(firstAssignmentDue);
    const dayOfWeekOffset = 1 - plainDateDue.dayOfWeek;
    return plainDateDue.add({days: dayOfWeekOffset});
}

export function getUpdatedStyleTermName(termStart:Temporal.PlainDate, weekCount:string|number, locale=DEFAULT_LOCALE) {
    const month = termStart.toLocaleString(locale, { month: '2-digit'})
    const day = termStart.toLocaleString(locale, { day: '2-digit'})
    const year = termStart.toLocaleString(locale, { year: '2-digit'})
    return `DE${weekCount}W${month}.${day}.${year}`;
}

export function getOldUgTermName(termStart:Temporal.PlainDate, locale=DEFAULT_LOCALE) {
    const year = termStart.toLocaleString(DEFAULT_LOCALE, { year: '2-digit'})
    const month = termStart.toLocaleString(DEFAULT_LOCALE, { month: 'short'})
    return `DE-${year}-${month}`;
}

export function getNewTermName(oldTermName:string, newTermStart:Temporal.PlainDate, locale= DEFAULT_LOCALE) {
    const [termName, weekCount] = oldTermName.match(/DE(\d)W\d\d\.\d\d\.\d\d/) || [];
    if (termName) return getUpdatedStyleTermName(newTermStart, weekCount);
    const termNameUg = oldTermName.match(/(DE(?:.HL|)-\d\d)-(\w+)\w{2}?/i);
    if (termNameUg) return getUpdatedStyleTermName(newTermStart, 5);
    throw new MalformedSyllabusError(`Can't Recognize Term Name ${oldTermName}`)
}

export function updatedDateSyllabusHtml(html: string, newStartDate: Temporal.PlainDate, locale = DEFAULT_LOCALE) {
    const syllabusBody = document.createElement('div');
    syllabusBody.innerHTML = html;
    const syllabusCalloutBox = syllabusBody.querySelector('div.cbt-callout-box');
    if(!syllabusCalloutBox) throw new MalformedSyllabusError("Can't find syllabus callout box");

    const paras = Array.from(syllabusCalloutBox.querySelectorAll('p'));
    const strongParas = paras.filter((para) => para.querySelector('strong'));
    if (strongParas.length < 5) throw new MalformedSyllabusError(`Missing syllabus headers\n${strongParas}`);

    const [
        _courseNameEl,
        termNameEl,
        datesEl,
        _instructorNameEl,
        _instructorContactInfoEl,
        _creditsEl
    ] = strongParas;

    const changedText: string[] = [];

    const oldTermName = termNameEl.textContent || '';
    const oldDates = datesEl.textContent || '';
    const dateRange = findDateRange(datesEl.innerHTML, locale);
    if (!dateRange) throw new MalformedSyllabusError("Date range not found in syllabus");

    const courseDuration = dateRange.start.until(dateRange.end);
    const newEndDate = newStartDate.add(courseDuration);
    const newTermName = getNewTermName(oldTermName, newStartDate)
    
    const dateRangeText = `${dateToSyllabusString(newStartDate)} - ${dateToSyllabusString(newEndDate)}`;

    termNameEl.innerHTML = `<strong>${syllabusHeaderName(termNameEl)}:</strong><span> ${newTermName}</span>`;
    datesEl.innerHTML = `<strong>${syllabusHeaderName(datesEl)}:</strong><span> ${dateRangeText}</span>`;

    changedText.push(`${oldTermName} -> ${termNameEl.textContent}`)
    changedText.push(`${oldDates} -> ${datesEl.textContent}`)

    const output = {
        html : syllabusBody.innerHTML.replaceAll(/<p>\s*(&nbsp;)?<\/p>/ig, ''),
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

export class NoOverviewModuleFoundError extends Error {
    public name = "NoOverviewModuleFoundError"
}

export class MalformedSyllabusError extends Error {
    public name="MalformedSyllabusError"
}

export class NoAssignmentsWithDueDatesError extends Error {
    public name = "NoAssignmentsWithDueDatesError"
}
