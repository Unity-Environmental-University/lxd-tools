import {findDateRange} from "../src/date";
import {Temporal} from "temporal-polyfill";
import assert = require('assert');

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
