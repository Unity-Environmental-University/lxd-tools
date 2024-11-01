import assert from "assert";
import {range} from "./canvas/canvasUtils";
import {Temporal} from "temporal-polyfill";

function getMonthNames(style: "numeric" | "2-digit" | "long" | "short" | "narrow" = "long", locale = 'en-US') {
    return Array.from(range(1, 12)).map((monthInt) => {
        return Temporal.PlainDate.from({
            day: 1,
            month: monthInt,
            year: Temporal.Now.plainDateISO().year
        }).toLocaleString(locale, {
            month: style
        })
    })
}

/**
 * takes a string of formatted [monthname] [date] and give a plain date
 * @param value the string to evaluate
 * @param locale the locale to use to generate month names, e.g. en-US
 * @param year the year to give the date object. If not provided defaults to current year.
 */
function plainDateFromMonthDayString(value: string, locale: string, year?:number) {
    year ??= Temporal.Now.plainDateISO().year;
    const match = value.match(getDateRegexString(locale));
    if (!match) throw new MalformedDateError(value);
    const fullDate = match[1];
    return Temporal.PlainDate.from({
        month: getMonthNumberLut(locale)[match[2]],
        day: parseInt(match[3]),
        year
    })
}

const monthNumberLutCache: Record<string, Record<string, number>> = {};

/**
 * returns a string with 3 capturing groups -- 1 - month date, 2 month, 3 date. cuts off rd/th...
 * @param locale
 */
function getMonthNumberLut(locale: string) {
    if (monthNumberLutCache[locale]) return monthNumberLutCache[locale];

    const monthNames = getMonthNames('long', locale);
    const shortMonthNames = getMonthNames('short', locale);

    const monthNumberLut: Record<string, number> = {};
    assert(monthNames.length === shortMonthNames.length);
    for (let i = 0; i < monthNames.length; i++) {
        monthNumberLut[monthNames[i]] = i + 1;
        monthNumberLut[shortMonthNames[i]] = i + 1;
    }
    monthNumberLutCache[locale] = monthNumberLut;
    return monthNumberLut;

}

const dateRegexStringCache: Record<string, string> = {};

//TODO: Make the capture groups in this optional
function getDateRegexString(locale = 'en-US') {
    if (dateRegexStringCache[locale]) return dateRegexStringCache[locale];

    const monthNames = getMonthNames('long', locale);
    const shortMonthNames = getMonthNames('short', locale);
    const monthRegexDatePart = `(?:${[...monthNames, ...shortMonthNames].join('|')})`;
    const output = `((${monthRegexDatePart}) (\\d+))(?:\\w{2}|)`;
    dateRegexStringCache[locale] = output;
    return output;
}

/**
 * Looks for a date range in text and, if found, returns an object with start and end params as Temporal PlainDates
 * @param textToSearch
 * @param locale
 */
export function findDateRange(textToSearch: string, locale = 'en-US') {
    const dateRegExString = getDateRegexString(locale);

    const searchRegex = new RegExp(`(${dateRegExString}).*(${dateRegExString})`, 'i');
    const dateRegex = new RegExp(dateRegExString, 'i')

    const matchRange = textToSearch.match(searchRegex);
    if (!matchRange) return null; //No date range found in syllabus

    let start, end;
    for(const separator of ['-', 'to']) {
        [start, end] = matchRange[0].split(separator)
        if(start && end) break;
    }
    if(!start || !end) throw new MalformedDateError('Cannot find date range in syllabus');

    const startMatch = start.match(dateRegex);
    const endMatch = end.match(dateRegex);
    if(!startMatch) throw new MalformedDateError(`Missing Start Date ${start}`)
    if(!endMatch) throw new MalformedDateError(`Missing End Date ${end}`)

    return {
        start: plainDateFromMonthDayString(startMatch[0], locale),
        end: plainDateFromMonthDayString(endMatch[0], locale)
    }
}

export function oldDateToPlainDate(date: Date) {
    const data = {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
    };
    return Temporal.PlainDate.from(data)
}

export class StringNotAMonthDateError extends Error {
    name = "StringNotAMonthDateError"
}

export class MalformedDateError extends Error {
    name="MalformedDateError"
}
