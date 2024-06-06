import {updatedDateSyllabusHtml} from '../changeStartDate'
import fs from "fs";
import {Temporal} from "temporal-polyfill";


describe('Syllabus date changes', () => {
    test('Changing date works for grad courses', () => {
        const now = Temporal.Now.plainDateISO();
        const syllabus = fs.readFileSync('./src/canvas/course/__mocks__/syllabus.grad.html').toString();
        const newSyllabus = updatedDateSyllabusHtml(syllabus, now);
        const month = now.toLocaleString('en-US', { month: "2-digit"})
        const day = now.toLocaleString('en-US', { day: "2-digit"})
        const year = now.toLocaleString('en-US', { year: "2-digit"})
        expect(newSyllabus.html).toContain(`DE8W${month}.${day}.${year}`)
    });
    test('Changing date works for undergrad courses', () => {
        const now = Temporal.Now.plainDateISO();
        const syllabus = fs.readFileSync('./src/canvas/course/__mocks__/syllabus.gallant.html').toString();
        const newSyllabus = updatedDateSyllabusHtml(syllabus, now);
        const month = now.toLocaleString('en-US', { month: "short"})
        const year = now.toLocaleString('en-US', { year: "2-digit"})
        expect(newSyllabus.html).toContain(`DE-${year}-${month}`)
    })

})
