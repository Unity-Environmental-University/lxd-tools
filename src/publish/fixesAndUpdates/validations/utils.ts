import {ICanvasCallConfig} from "@canvas/canvasUtils";
import {IContentHaver, ISyllabusHaver} from "@canvas/course/courseTypes";
import {BaseContentItem} from "@canvas/content/BaseContentItem";
import {overrideConfig} from "@canvas/fetch/utils";

//number of characters to show around a match
const SHOW_WINDOW = 30;
const MAX_SEARCH_RETURN_SIZE = 100;

export type MessageResult = {
    bodyLines: string[],
    links?: string[]
}


export type ValidationResult<UserDataType = unknown> = {
    userData?: UserDataType,
    success: boolean | 'unknown' | 'not run',
    messages: MessageResult[],
    links?: string[],
}




export function stringsToMessageResult(value:string[] | string, links?: string[] | string) {
    const messageResult:MessageResult = {bodyLines: Array.isArray(value) ? value : [value]}
    if(links) messageResult.links = Array.isArray(links)? links : [links]
    return messageResult;
}

function ensureMessageResults(value: string | string[] | MessageResult[] | MessageResult) {
    if(!Array.isArray(value)) return typeof value === 'string' ? [stringsToMessageResult(value)] : [value];
    if(value.length === 0) return value as MessageResult[];
    if(typeof value[0] === 'string') return [stringsToMessageResult(value as string[])];
    return value as MessageResult[];
}




type TestResultOptions<T> = {
    failureMessage?: string | string[] | MessageResult[] | MessageResult,
    links?: string[],
    notFailureMessage?: string | string[] | MessageResult[] | MessageResult,
    userData?: T,
}

const testResultDefaults = {
    failureMessage: 'failure',
    notFailureMessage: 'success'
}

/**
 * Processes the result of a test and returns a structured validation result.
 *
 * @param success - Indicates the success state of the test. It can be a boolean
 *                  or one of the three string states: "unknown" or "not run".
 *                  If undefined, it defaults to "unknown".
 * @param options  - Optional settings that affect the output, including:
 *                   - failureMessage: Message shown if the test fails.
 *                   - notFailureMessage: Message shown if the test did not fail.
 *                   - links: Optional links related to the test result.
 *                   - userData: Additional user context to include in the result, especially
 *                   used to pass data from a validation run into the fix run so we don't
 *                   have to duplicate checks/ collection of bad links.
 *
 * @returns A ValidationResult object containing the success state, relevant messages,
 *          and possibly user data and links.
 *
 * @example
 * const result = testResult(true, {
 *     failureMessage: "Test failed due to X.",
 *     notFailureMessage: "Test passed successfully!",
 *     links: { documentation: "http://example.com/test-docs" },
 *     userData: { userId: 12345 }
 * });
 * console.log(result);
 * // Output: {
 * //   success: true,
 * //   messages: "Test passed successfully!",
 * //   userData: { userId: 12345 },
 * //   links: { documentation: "http://example.com/test-docs" }
 * // }
 */
export function testResult<UserData>(
    success: boolean | "unknown" | "not run" | undefined, options?: TestResultOptions<UserData> ): ValidationResult<UserData> {
    const displayMessage = success === 'unknown' ? success : !!success;
    const reportedSuccess = success === undefined ? 'unknown' : success;

    const localOptions = { ...testResultDefaults, ...options };
    let { failureMessage, notFailureMessage } = localOptions;
    const { links, userData } = localOptions;

    failureMessage = ensureMessageResults(failureMessage);
    notFailureMessage = ensureMessageResults(notFailureMessage);

    const response: ValidationResult<UserData> = {
        success: reportedSuccess,
        messages: displayMessage ? notFailureMessage : failureMessage,
        userData
    };
    if (links) response.links = links;
    return response;
}



export function capitalize(str: string) {
    return str.replace(/\b[a-z]/g, (substring: string) => substring.toUpperCase());
}

export function preserveCapsReplace(regex: RegExp, replace: string) {
    return (substring: string, ..._args: any[]) => {
        const replacedSubstring = substring.replace(regex, replace);
        if (substring.toUpperCase() === substring) return replacedSubstring.toUpperCase();
        if (capitalize(substring) === substring) return capitalize(replacedSubstring);
        return replacedSubstring;
    }
}

export function matchHighlights(content: string, search: RegExp, maxHighlightLength = MAX_SEARCH_RETURN_SIZE, windowSize = SHOW_WINDOW) {


    search.lastIndex = 0;
    const matches = search.global ? Array.from(content.matchAll(search)) : [];
    search.lastIndex = 0;
    if (!search.global) {
        const match = search.exec(content);
        if (match) matches.push(match);
    }
    return matches.map(match => {
        const minIndex = Math.max(0, match.index - windowSize)
        const maxIndex: number = Math.min(content.length, match.index + match[0].length + windowSize);
        let substring = content.substring(minIndex, maxIndex);
        if (substring.length > maxHighlightLength) {
            const half = Math.floor(maxHighlightLength / 2)
            substring = substring.replace(new RegExp(`^(.{${half}}).*(.{${half}})$`), '$1...$2');
        }
        return substring;
    })
}


type CustomContentGetter<
    CourseType extends IContentHaver,
    ContentType extends BaseContentItem
> = (course:CourseType) => Promise<ContentType[]>

export function badContentRunFunc<
    CourseType extends IContentHaver,
    ContentType extends BaseContentItem,
>(
    badTest: RegExp,
    contentFunc?:CustomContentGetter<CourseType, ContentType>
) {
    return async (course: CourseType, config?: ICanvasCallConfig) => {
        const defaultConfig:ICanvasCallConfig = {queryParams: {include: ['body'], per_page: 50}};
        const content = await (contentFunc ? contentFunc(course) :
            course.getContent(overrideConfig(config, defaultConfig)));

        const badContent = content.filter(item => item.body && badTest.test(item.body))
        const syllabus = await course.getSyllabus();
        const syllabusTest = badTest.test(syllabus);
        const success = badContent.length === 0 && !syllabusTest;
        const links: string[] = [];
        const failureMessage: MessageResult[] = []

        if (badContent.length > 0) {
            const messageSets = badContent.map(a => {

                if (!a.body?.length) return {bodyLines: [a.name], links: [a.htmlContentUrl]};

                const content = a.body;
                return {
                    bodyLines: matchHighlights(content, badTest),
                    links: [a.htmlContentUrl]
                }
            })
            failureMessage.push(...messageSets)
        }

        if (syllabusTest) failureMessage.push({
            bodyLines: matchHighlights(syllabus, badTest),
            links: [`/courses/${course.id}/assignments/syllabus`]
        })

        const result = testResult(success, {failureMessage, links})

        if (!success) result.links = badContent.map(content => content.htmlContentUrl)
        return result;
    }

}


export function badSyllabusRunFunc(
        badTest: RegExp,
) {
    return async (course:ISyllabusHaver) => {
        const syllabus = await course.getSyllabus();
        const match = syllabus.match(badTest);
        const success = match === null;
        return testResult(success, {
            failureMessage: matchHighlights(syllabus, badTest),
            links: [`/courses/${course.id}/assignments/syllabus`]
        })
    }

}



export function badSyllabusFixFunc(
    validateRegEx: RegExp ,
    replace: string | ((str: string, ...args: any[]) => string)
    ) {
    const replaceText = replaceTextFunc(validateRegEx, replace);
    return async (course: ISyllabusHaver) => {
        try {
            await fixSyllabus(course, validateRegEx, replaceText);
            return testResult<never>(true)
        } catch (e) {
            return errorMessageResult(undefined)
        }

    }

}


export function badContentFixFunc<CourseType extends IContentHaver, ContentType extends BaseContentItem>(
    badContentRegex: RegExp,
    replace: string | ((str: string, ...args: any[]) => string),
    contentFunc?: CustomContentGetter<CourseType, ContentType>
    ) {
    return async (course: CourseType): Promise<ValidationResult<never>> => {
        let success = false;
        const messages: MessageResult[] = [];

        const testRegex = new RegExp(badContentRegex.source, badContentRegex.flags.replace('g',''))
        const includeBody = {queryParams: {include: ['body']}};
        let content = await( contentFunc ? contentFunc(course) : course.getContent(includeBody));
        content = content.filter(item => item.body && testRegex.test(item.body));

        badContentRegex.lastIndex = 0;
        const replaceText = replaceTextFunc(badContentRegex, replace);
        badContentRegex.lastIndex = 0;
        if (!contentFunc) await fixSyllabus(course, badContentRegex, replaceText);
        if (content.length === 0) {
            return testResult('not run', {
                failureMessage: "No content fixed"
            })
        }
        success = true;
        for (const item of content) {
            if (!item.body) continue;
            if (!badContentRegex.test(item.body)) continue;
            const newText = replaceText(item.body)
            if (badContentRegex.test(newText)) {
                success = false;
                messages.push({
                    bodyLines: [`fix broken for ${item.name}`],
                    links: [item.htmlContentUrl]
                })
                continue;
            }

            try {
                await item.updateContent(newText);
                messages.push({
                    bodyLines: [`fix succeeded for ${item.name}`],
                    links: [item.htmlContentUrl]
                })

            } catch (e) {
                return errorMessageResult(e, [item.htmlContentUrl])
            }
        }

        return {
            success,
             messages
        }
    }
}



function replaceTextFunc(validateRegEx: RegExp, replace: string | ((text: string) => string)) {
    return (str: string) => {
        validateRegEx.lastIndex = 0;
        const out = typeof replace === 'string' ?
            str.replaceAll(validateRegEx, replace):
            str.replaceAll(validateRegEx, replace); //This is the silliest thing in the world, but the regex overloads wont recognize it otherwise.
        validateRegEx.lastIndex = 0; //Resetting the lastIndex so the regext starts from the beginning of the string every time.

        return out;
    }

}

async function fixSyllabus(course: ISyllabusHaver, validateRegEx: RegExp, replaceText: (text: string) => string) {
    const syllabus = await course.getSyllabus();
    if (validateRegEx.test(syllabus)) {
        const newText = replaceText(syllabus);
        if (validateRegEx.test(newText)) throw new Error("Fix broken for syllabus " + validateRegEx.toString() + newText);
        await course.changeSyllabus(newText);
    }

}

export function errorMessageResult(e: unknown, links?: string[]) {
    const bodyLines = [
        e?.toString() || 'Error',
    ]
    if (e && e instanceof Error && e.stack) bodyLines.push( e.stack);

    return { success:false, messages: [{bodyLines}], links};
}