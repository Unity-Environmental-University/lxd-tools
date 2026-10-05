import {findDateRange, MalformedDateError, ImplausibleYearError, oldDateToPlainDate} from "@/date";
import {Temporal} from "temporal-polyfill";
import assert from "assert";
const testStart = {
    month: 4,
    day: 1,
    year: Temporal.Now.plainDateISO().year
}

const testEnd = {
    month: 5,
    day: 30,
    year: Temporal.Now.plainDateISO().year
}


test('Date range works for hyphenates', () => {
    const range = findDateRange('April 1 - May 30');
    assert(range);
    expect(range);
    expect(range.start.until(testStart).days).toBe(0);
    expect(range.end.until(testEnd).days).toBe(0);
})

test('Date range works with "to" as a separator"', () => {
    const range = findDateRange('April 1 to May 30');
    assert(range);
    expect(range);
    expect(range.start.until(testStart).days).toBe(0);
    expect(range.end.until(testEnd).days).toBe(0);
})

test('findDateRange throws error for a date range', () => {
    expect(() => findDateRange('No dates here')).toThrow();
});

test('findDateRange throws error for malformed date range', () => {
    expect(() => findDateRange('April 1 -')).toThrow(MalformedDateError);
    expect(() => findDateRange('- May 30')).toThrow(MalformedDateError);
    expect(() => findDateRange('April 1 May 30')).toThrow(MalformedDateError);
});

test('findDateRange handles mixed separators correctly', () => {
    const range = findDateRange('April 1 - May 30 to June 15');
    expect(range).toBeTruthy();
    expect(range?.start.month).toBe(4);
    expect(range?.start.day).toBe(1);
    expect(range?.end.month).toBe(5);
    expect(range?.end.day).toBe(30);
});

//TODO: This test is skipped because the locale 'fr-FR' is not supported in the current environment.
test.skip('findDateRange works with different locales', () => {
    const range = findDateRange('1 avril - 30 mai', 'fr-FR');
    expect(range).toBeTruthy();
    expect(range?.start.month).toBe(4);
    expect(range?.start.day).toBe(1);
    expect(range?.end.month).toBe(5);
    expect(range?.end.day).toBe(30);
});

//TODO: This test is skipped because the locale 'es-ES' is not supported in the current environment.
test.skip('findDateRange handles invalid locale gracefully', () => {
    expect(() => findDateRange('April 1 - May 30', 'invalid-locale')).toThrow(Error);
});

test('oldDateToPlainDate accepts a date near the current year', () => {
    const currentYear = Temporal.Now.plainDateISO().year;
    const date = new Date(currentYear, 6, 13); // July 13 (month is 0-indexed)
    const plainDate = oldDateToPlainDate(date);
    expect(plainDate.year).toBe(currentYear);
    expect(plainDate.month).toBe(7);
    expect(plainDate.day).toBe(13);
});

test('oldDateToPlainDate rejects an implausibly distant year', () => {
    // Reproduces the malformed-input bug: a stray digit typed into the date field
    // (e.g. "7/1/202613" parsed by the browser) yields a Date with a garbage year.
    const date = new Date(202613, 6, 1);
    expect(() => oldDateToPlainDate(date)).toThrow(ImplausibleYearError);
});

test('oldDateToPlainDate rejects a year far in the past', () => {
    const date = new Date(1500, 0, 1);
    expect(() => oldDateToPlainDate(date)).toThrow(ImplausibleYearError);
});