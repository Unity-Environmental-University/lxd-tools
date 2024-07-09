import {NoAssignmentsWithDueDatesError, sortAssignmentsByDueDate, updatedDateSyllabusHtml} from '../changeStartDate'
import fs from "fs";
import {Temporal} from "temporal-polyfill";
import {oldDateToPlainDate} from "../../../date";
import assert from "assert";
import {mockAssignmentData} from "../../content/__mocks__/mockContentData";
import {range} from "../../canvasUtils";
import {Assignment} from "@/canvas/content/assignments";


describe('Syllabus date changes', () => {
    const baseSyllabus = fs.readFileSync('./src/canvas/course/__mocks__/syllabus.gallant.html').toString();

    test('Changing date works for grad courses', () => {
        const now = Temporal.Now.plainDateISO();
        const syllabus = fs.readFileSync('./src/canvas/course/__mocks__/syllabus.grad.html').toString();
        const newSyllabus = updatedDateSyllabusHtml(syllabus, now);
        const month = now.toLocaleString('en-US', {month: "2-digit"})
        const day = now.toLocaleString('en-US', {day: "2-digit"})
        const year = now.toLocaleString('en-US', {year: "2-digit"})
    });
    test('Changing date works for undergrad courses', () => {
        const now = Temporal.Now.plainDateISO();
        const syllabus = fs.readFileSync('./src/canvas/course/__mocks__/syllabus.gallant.html').toString();
        const newSyllabus = updatedDateSyllabusHtml(syllabus, now);
        const month = now.toLocaleString('en-US', {month: "2-digit"})
        const day = now.toLocaleString('en-US', {day: "2-digit"})
        const year = now.toLocaleString('en-US', {year: "2-digit"})
        expect(newSyllabus.html).toContain(`DE5W${month}.${day}.${year}`)
    })

    test('changing date does not double paragraph tags', () => {
        const now = Temporal.Now.plainDateISO();
        const newSyllabus = updatedDateSyllabusHtml(baseSyllabus, now);
        expect(newSyllabus).not.toContain('<p>&nbsp;</p>')
        expect(newSyllabus).not.toContain('<p></p>')
        expect(newSyllabus).not.toContain(/<p>\s*<\/p>/)
    })
})

function shuffle<T>(list:T[]) {
    const source = [...list];
    const dest:T[] = [];
    while(source.length > 0) {
        const index = Math.floor(Math.random() * source.length);
        dest.push(...source.splice(index, 1))
    }
    return dest;
}

describe('sortAssignmentsByDate', () => {
    const now = Temporal.Now;
    const mockAssignments:Assignment[] = shuffle([...range(0, 10)].map(i => {
        return new Assignment({
            ...mockAssignmentData,
            id: i,
            due_at: now.plainDateTimeISO().add({days: 100 - i}).toString(),
        }, 0);
    }));



    it('sorts assignment by date', () => {

        const sorted = sortAssignmentsByDueDate(mockAssignments);
        for(let i = 1; i < sorted.length; i++) {
            const prev = sorted[i - 1];
            const current = sorted[i];
            expect(prev.dueAt?.getTime()).toBeLessThan(current.dueAt!.getTime())
        }
    })

    it('sorts non-due-date assignments to the end', () => {
        const toSort = shuffle([...mockAssignments,
            new Assignment({ ...mockAssignmentData, due_at: null}, -98),
            new Assignment({ ...mockAssignmentData, due_at: null}, -99)
        ])
        const sorted = sortAssignmentsByDueDate(toSort);
        const dates = sorted.map(value => value.dueAt);
        expect(dates[sorted.length - 1]).toBeNull();
        expect(dates[sorted.length - 2]).toBeNull();
    })

})