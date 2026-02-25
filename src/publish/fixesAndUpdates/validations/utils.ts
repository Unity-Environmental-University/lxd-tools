import {ICanvasCallConfig} from "@ueu/ueu-canvas/canvasUtils";
import {IContentHaver, ICourseDataHaver, IIdHaver, ISyllabusHaver} from "@ueu/ueu-canvas/course/courseTypes";
import {BaseContentItem} from "@ueu/ueu-canvas/content/BaseContentItem";
import {overrideConfig} from "@ueu/ueu-canvas/fetch/utils";
import {ICourseData} from "@ueu/ueu-canvas/courseTypes";

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


export function stringsToMessageResult(value: string[] | string, links?: string[] | string) {
    const messageResult: MessageResult = {bodyLines: Array.isArray(value) ? value : [value]}
    if (links) messageResult.links = Array.isArray(links) ? links : [links]
    return messageResult;
}

function ensureMessageResults(value: string | string[] | MessageResult[] | MessageResult) {
    if (!Array.isArray(value)) return typeof value === 'string' ? [stringsToMessageResult(value)] : [value];
    if (value.length === 0) return value as MessageResult[];
    if (typeof value[0] === 'string') return [stringsToMessageResult(value as string[])];
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
    success: boolean | "unknown" | "not run" | undefined, options?: TestResultOptions<UserData>): ValidationResult<UserData> {
    const displayMessage = success === 'unknown' ? success : !!success;
    const reportedSuccess = success === undefined ? 'unknown' : success;

    const localOptions = {...testResultDefaults, ...options};
    let {failureMessage, notFailureMessage} = localOptions;
    const {links, userData} = localOptions;

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
> = (course: CourseType) => Promise<ContentType[]>

export function badContentRunFunc<
    CourseType extends IContentHaver,
    ContentType extends BaseContentItem,
>(
    badTest: RegExp,
    contentFunc?: CustomContentGetter<CourseType, ContentType>
) {
    return async (course: CourseType, config?: ICanvasCallConfig) => {
        const defaultConfig: ICanvasCallConfig = {queryParams: {include: ['body'], per_page: 50}};
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
    if(!badTest.global) badTest = new RegExp(badTest, 'g');
    return async (course: ISyllabusHaver) => {
        const syllabus = await course.getSyllabus();
        const match = syllabus.match(badTest);
        const success = match === null;
        return testResult(success, {
            failureMessage: matchHighlights(syllabus, badTest),
            links: [`/courses/${course.id}/assignments/syllabus`]
        })
    }
}



export const queryFindFirst = <T extends Element>(
    el: Element,
    querySelector: string,
    filter: (element: T) => boolean
): T | undefined => {
    // eslint-disable-next-line @/no-undef
    const queriedEls = el.querySelectorAll(querySelector) as NodeListOf<T>;
    for (const queriedEl of queriedEls) {
        if (filter(queriedEl)) return queriedEl;
    }
    return undefined;
};


export const isCorrectSectionFunc = (sectionHeaderSearch: string | RegExp) =>
    ({innerText, textContent}:HTMLElement) =>
        (innerText ?? textContent)?.search(sectionHeaderSearch) > -1 || false;


/**
 * Represents detailed user data for a validation error, providing a structured way to capture
 * information about the course, the error that occurred, and any additional context-specific data.
 *
 * @template CourseType - The type of the course object associated with the validation error.
 *                        Typically extends `IIdHaver` to ensure the course has a unique identifier.
 * @template DataType - An object type representing additional fields specific to the context
 *                      of the validation. Allows extending the error data with custom attributes.
 *
 * @property {CourseType} course - The course object associated with the validation error. This
 *                                 allows consumers to trace errors back to the specific course
 *                                 being processed.
 * @property {unknown} [error] - An optional field to capture the error that caused the validation
 *                               failure. Useful for debugging and logging purposes.
 * @property {Record<string, unknown>} [additionalInfo] - An optional object for providing extra
 *                                                        context about the error. This can include
 *                                                        any metadata or runtime information
 *                                                        relevant to the validation process.
 * @property {DataType} - Additional custom fields extending the base structure to include
 *                        context-specific data for the validation scenario.
 *
 * @example
 * // Example usage within a validation function:
 * export function validateCourse(course: ISyllabusHaver): Promise<ValidationResult<ValidationErrorUserData<ISyllabusHaver, { missingSections: string[] }>>> {
 *     try {
 *         // Perform some validation logic...
 *         const missingSections = ["Introduction", "Conclusion"];
 *         if (missingSections.length > 0) {
 *             return Promise.resolve(
 *                 testResult(false, {
 *                     course,
 *                     additionalInfo: { missingSections },
 *                     failureMessage: `Course is missing required sections: ${missingSections.join(", ")}`,
 *                 })
 *             );
 *         }
 *         return Promise.resolve(testResult(true, {}));
 *     } catch (e) {
 *         return Promise.resolve(
 *             testResult(false, {
 *                 course,
 *                 error: e,
 *                 additionalInfo: { attemptedValidation: "required sections check" },
 *                 failureMessage: `Error during validation: ${e}`,
 *             })
 *         );
 *     }
 * }
 */
export type ValidationErrorUserData<CourseType extends IIdHaver, DataType extends Record<string, any>> = {
    course: CourseType;
    error?: unknown;
    additionalInfo?: Record<string, unknown>;
} & DataType;

function isErrorUserData(userData: InSyllabusSectionFuncUserData): userData is InSyllabusSectionFuncErrorData {
    return (userData as InSyllabusSectionFuncErrorData).error !== undefined;
}

export type InSyllabusSectionFuncErrorData = ValidationErrorUserData<ISyllabusHaver, {
    course: ISyllabusHaver;
    error: unknown;
}>;


export type InSyllabusSectionFuncUserData =
    | { sectionEl: HTMLElement | null | undefined; syllabusEl: HTMLElement, headerEl: HTMLElement | null | undefined }
    | InSyllabusSectionFuncErrorData;

export function syllabusToEl(syllabus: string): HTMLElement {
    const syllabusEl = document.createElement("div");
    syllabusEl.innerHTML = syllabus;
    return syllabusEl;
}

/**
 * Validates whether a syllabus contains a specific section with the given header and body content.
 *
 * This function searches a course syllabus for a section header and its associated body text,
 * allowing for flexible matching using strings or regular expressions. It returns a function
 * that asynchronously validates the course, producing a `ValidationResult` with detailed
 * user data on success or failure.
 *
 * @param {string | RegExp} sectionHeaderSearch - A (non-empty string) or regular expression to match the
 *                                                desired section header in the syllabus. Throws an error on an empty string.
 * @param {string | RegExp} sectionBodySearch - A (non-empty string) or regular expression to match the
 *                                              content of the section body associated with
 *                                              the matched header. Throws an error on an empty string.
 *
 * @returns {(course: ISyllabusHaver) => Promise<ValidationResult<InSyllabusSectionFuncUserData>>}
 *          A function that accepts a course implementing the `ISyllabusHaver` interface and
 *          returns a promise resolving to a `ValidationResult` object. The result indicates
 *          whether the validation passed or failed and provides detailed error or success
 *          metadata.
 *
 * ### User Data on Failure
 * On validation failure, the result's `userData` object includes:
 * - `syllabusEl`: The parsed syllabus as a `HTMLElement`.
 * - `sectionEl`: The header element that was searched for but not found.
 * - Failure-specific data such as the `sectionHeaderSearch` and `sectionBodySearch` criteria.
 *
 * ### User Data on Success
 * On success, the result's `userData` object includes:
 * - `syllabusEl`: The parsed syllabus as a `HTMLElement`.
 * - `sectionEl`: The matched header element.
 *
 * @example
 * // Example usage in a validation pipeline:
 * const validateSection = inSyllabusSectionFunc(/Week 1: Introduction/, /Learn the basics/);
 * const result = await validateSection(course);
 *
 * if (!result.success) {
 *     console.error(result.failureMessage, result.userData);
 * } else {
 *     console.log("Validation passed!", result.userData);
 * }
 *
 * @throws {Error} Throws an error if the syllabus cannot be retrieved or processed.
 *
 * ### Error Handling
 * If an error occurs during syllabus retrieval or parsing, the result includes:
 * - `error`: The captured error object.
 * - `course`: The course object being validated.
 * - `failureMessage`: A descriptive message with error details.
 */
export function inSyllabusSectionFunc(
    sectionHeaderSearch: (string ) | RegExp,
    sectionBodySearch: string | RegExp,
): ((course: ISyllabusHaver) => Promise<ValidationResult<InSyllabusSectionFuncUserData>>) {
    const isCorrectSection = isCorrectSectionFunc(sectionHeaderSearch);
    if(typeof sectionHeaderSearch === 'string' && sectionHeaderSearch.length == 0) throw new Error('Section header search strings must have a value. If you want to match ALL sections, use /.*/')
    if(typeof sectionBodySearch === 'string' && sectionBodySearch.length == 0) throw new Error('Section body search strings must have a value. If you want to match all, use /.*/ instead')

    return async (course: ISyllabusHaver) => {
        try {
            const syllabus = await course.getSyllabus();
            const syllabusEl = syllabusToEl(syllabus);
            const headerEl = queryFindFirst(syllabusEl, 'h2,h3,h4', isCorrectSection);
            const sectionEl = headerEl?.parentElement;
            const userData = { sectionEl, syllabusEl, headerEl};
            
            if (!sectionEl) {
                return testResult(false, {
                    failureMessage: `Could not find section with name ${sectionHeaderSearch} in syllabus`,
                    userData,
                });
            }

            const html = sectionEl.innerHTML;
            const success = html.search(sectionBodySearch) > -1;
            return testResult(success, {
                userData,
                failureMessage: `"${sectionBodySearch.toString()} not found in ${sectionEl.innerHTML}"`,
            });
        } catch (e) {
            return testResult(false, {
                userData: {
                    sectionHeaderSearch,
                    sectionBodySearch,
                    course,
                    error: e,
                },
                failureMessage: `Error processing syllabus for ${course.id}: ${e}`,
            });
        }
    };
}


export enum AddPosition {
    AtBeginning,
    AtEnd,
    DirectlyAfterHeader
}

export enum SpecialPosition {
    BeforeHeader,


}



/**
 * Adds a new subsection to a syllabus section in a course.
 * @param run
 * @param newSubSectionHtml
 * @param position
 */
export function addSyllabusSectionFix(
    run: (course:ISyllabusHaver & ICourseDataHaver) => Promise<ValidationResult<InSyllabusSectionFuncUserData>>,
    newSubSectionHtml: string,
    position: AddPosition | [SpecialPosition, string] = AddPosition.AtEnd,
) {
    return async (course: ISyllabusHaver & ICourseDataHaver, result: ValidationResult<InSyllabusSectionFuncUserData> | undefined
    )  => {
        if (!result) result = await run(course);
        if(!result.userData || isErrorUserData(result.userData)) return result;
        const { sectionEl, syllabusEl, headerEl } =  result.userData;
        if(!sectionEl) return testResult(false, {failureMessage : "Section El to fix not found", userData: undefined})

        if (Array.isArray(position)) {
            const [specialPosition, headerSearch] = position;
            if(specialPosition === SpecialPosition.BeforeHeader) {
                const beforeHeaderEl = queryFindFirst(syllabusEl, 'h2,h3,h4', isCorrectSectionFunc(headerSearch));
                if(!beforeHeaderEl) {
                    return testResult(false, { failureMessage: `Could not find header to insert before ${headerSearch}`, userData: undefined });
                }
                beforeHeaderEl.insertAdjacentHTML('beforebegin', newSubSectionHtml);
                const changeResponse = await course.changeSyllabus( syllabusEl.innerHTML) as ICourseData;

                const success = changeResponse.syllabus_body?.includes(newSubSectionHtml);

                return testResult(success, {
                    userData: {sectionEl, syllabusEl},
                    failureMessage: success ? [] : [{bodyLines: ["Failed to update syllabus"]}],
                });
            } else {
                throw Error("Special Position Not Handled")
            }
        }




        if (position == AddPosition.AtEnd) {
            sectionEl.insertAdjacentHTML('beforeend', newSubSectionHtml)
        } else if (position == AddPosition.AtBeginning) {
            const firstHeader = sectionEl.querySelector('h1, h2, h3, h4, h5, h6');
            if (firstHeader) {
                firstHeader.insertAdjacentHTML('afterend', newSubSectionHtml);
            } else {
                return testResult(false, { failureMessage: "No header element found to insert after", userData: undefined });
            }
        } else if(position == AddPosition.DirectlyAfterHeader) {
            headerEl?.insertAdjacentHTML("afterend", newSubSectionHtml);
        } else {
            throw Error("Insert Position Not Handled")
        }

        const failureMessage: MessageResult[] = [];

        const changeResponse = await course.changeSyllabus( syllabusEl.innerHTML) as ICourseData;

        /* This is optimistic at best */
        const success = changeResponse.id === course.id;

        return testResult(success, {
            userData: {sectionEl, syllabusEl},
            failureMessage,
        });
    }
}


export function badSyllabusFixFunc(
    validateRegEx: RegExp,
    replace: string | ((str: string, ...args: any[]) => string)
) {
    const replaceText = replaceTextFunc(validateRegEx, replace);
    return async (course: ISyllabusHaver) => {
        try {
            await fixSyllabus(course, validateRegEx, replaceText);
            return testResult<never>(true)
        } catch (e) {
            return errorMessageResult(e)
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

        const testRegex = new RegExp(badContentRegex.source, badContentRegex.flags.replace('g', ''))
        const includeBody = {queryParams: {include: ['body']}};
        let content = await (contentFunc ? contentFunc(course) : course.getContent(includeBody));
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
            str.replaceAll(validateRegEx, replace) :
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
    if (e && e instanceof Error && e.stack) bodyLines.push(e.stack);

    return {success: false, messages: [{bodyLines}], links};
}