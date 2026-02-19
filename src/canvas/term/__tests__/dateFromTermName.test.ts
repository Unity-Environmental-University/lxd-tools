import dateFromTermName from "@ueu/ueu-canvas/term/dateFromTermName";
import { Temporal } from "temporal-polyfill";


const month = 7;
const day = 12;
const year = 2024;
const date = Temporal.PlainDate.from    ({ month, day, year})
describe('dateFromTermName', () => {
    it('works for undergrad', () => {
        expect(dateFromTermName('DE5W07.12.24')).toEqual(date)
    })
    it('works for grad', () => {
        expect(dateFromTermName('DE8W07.12.24')).toEqual(date);
    })
    it('works when part of a course name', () => {
        expect(dateFromTermName('DE8W07.12.24_TEST000-1: Test')).toEqual(date);
    })
    it('is undefined if it doesnt see a term name', () => {
        expect(dateFromTermName('ABCD1223.234.1')).toBeUndefined();
    })
})