import {
    getModuleUnlockStartDate, getNewTermName, getOldUgTermName, getStartDateAssignments, MalformedSyllabusError,
    NoAssignmentsWithDueDatesError, NoOverviewModuleFoundError,
    sortAssignmentsByDueDate,
    updatedDateSyllabusHtml
} from '../changeStartDate'
import fs from "fs";
import {Temporal} from "temporal-polyfill";
import {oldDateToPlainDate} from "../../../date";
import assert from "assert";
import {mockAssignmentData} from "../../content/__mocks__/mockContentData";
import {range} from "../../canvasUtils";
import mockModuleData from "@/canvas/course/__mocks__/mockModuleData";
import {Assignment} from "@/canvas/content/assignments/Assignment";


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

function shuffle<T>(list: T[]) {
    const source = [...list];
    const dest: T[] = [];
    while (source.length > 0) {
        const index = Math.floor(Math.random() * source.length);
        dest.push(...source.splice(index, 1))
    }
    return dest;
}

describe('sortAssignmentsByDate', () => {
    const now = Temporal.Now;
    const mockAssignments: Assignment[] = shuffle([...range(0, 10)].map(i => {
        return new Assignment({
            ...mockAssignmentData,
            id: i,
            due_at: now.plainDateTimeISO().add({days: 100 - i}).toString(),
        }, 0);
    }));


    it('sorts assignment by date', () => {

        const sorted = sortAssignmentsByDueDate(mockAssignments);
        for (let i = 1; i < sorted.length; i++) {
            const prev = sorted[i - 1];
            const current = sorted[i];
            expect(prev.dueAt?.getTime()).toBeLessThan(current.dueAt!.getTime())
        }
    })

    it('sorts non-due-date assignments to the end', () => {
        const toSort = shuffle([...mockAssignments,
            new Assignment({...mockAssignmentData, due_at: null}, -98),
            new Assignment({...mockAssignmentData, due_at: null}, -99)
        ])
        const sorted = sortAssignmentsByDueDate(toSort);
        const dates = sorted.map(value => value.dueAt);
        expect(dates[sorted.length - 1]).toBeNull();
        expect(dates[sorted.length - 2]).toBeNull();
    })

})

describe('getCurrentStartDate', () => {
    it('returns a temporal plainDate if there\'s a module lock date', () => {
        const mockModules = [
            {...mockModuleData, unlock_at: '2022-12-24T00:00:00Z'},
        ]
        expect(getModuleUnlockStartDate(mockModules)).toEqual(new Temporal.PlainDate(
            2022, 12, 24));
    })
    it("throws an error if it can't find overview module", () => {
        expect(() => getModuleUnlockStartDate([])).toThrowError(NoOverviewModuleFoundError)
    })
    it("returns null if there's no lock date in the first module", () => {
        const mockModules = [
            {...mockModuleData, unlock_at: null}
        ]
        expect(getModuleUnlockStartDate(mockModules)).toBeNull()
    })
})

describe('getStartDateAssignments', () => {
    function datesToAssignment([year, month, day]: [string, string, string]) {
        return new Assignment({
            ...mockAssignmentData,
            due_at: `${year}-${month}-${day}T00:00:00Z`
        }, 0)
    }

    it('gets the first assignment due and returns the monday of that week', () => {
        const assignments = ([
            ['2024', '07', '19'],
            ['2024', '08', '19'],
            ['2024', '07', '18'],
            ['2024', '09', '19'],
        ] as [string, string, string][]).map(datesToAssignment);

        expect(getStartDateAssignments(assignments)).toEqual(new Temporal.PlainDate(2024, 7, 15))
    })

    it('throws an error if there are no assignments with due dates', () => {
        const assignments = ([new Assignment({...mockAssignmentData, due_at: null}, 0)])
        expect(() => getStartDateAssignments(assignments)).toThrow(NoAssignmentsWithDueDatesError)
    })

    describe('getNewTermName', () => {
        const newTermStart = new Temporal.PlainDate(2024, 12, 1);
        it('throws an error with a bad term name', () => {
            expect(() => getNewTermName('ABCDEFGX', newTermStart)).toThrow(MalformedSyllabusError)
        })

        it('returns a new style grad term name from old style grad term name', () => {
            expect(getNewTermName('DE8W05.07.22', newTermStart)).toEqual('DE8W12.01.24')
        })
        it('returns a new style undergrad term name from old style undergrad term name', () => {
            expect(getNewTermName('DE/HL-22-Dec', newTermStart)).toEqual('DE5W12.01.24')
        })

    })

    describe('getOldUgTermName', () => {
        it('returns a legacy old styl ug term name', () => {
            expect(getOldUgTermName(new Temporal.PlainDate(2024, 12, 24))).toEqual('DE-24-Dec')
        })
    })
})