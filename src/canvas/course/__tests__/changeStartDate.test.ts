import {updatedDateSyllabusHtml} from '../changeStartDate'
import fs from "fs";
import {Temporal} from "temporal-polyfill";


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