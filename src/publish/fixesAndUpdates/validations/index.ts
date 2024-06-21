import {deepObjectMerge, ICanvasCallConfig} from "../../../canvas/canvasUtils";
import {IContentHaver, ISyllabusHaver} from "../../../canvas/course/courseTypes";
import {Course} from "../../../canvas/course/Course";

//number of characters to show around a match
const SHOW_WINDOW = 30;
const MAX_SEARCH_RETURN_SIZE = 100;

export type MessageResult = {
    bodyLines: string[],
    links?: string[]
}


export type ValidationResult<UserDataType = unknown> = {
    userData?: UserDataType,
    success: boolean | 'unknown',
    messages: MessageResult[],
    links?: string[],
}



export type CourseValidation<T = Course, UserDataType = unknown, FixUserDataType = UserDataType> = {
    courseCodes?: string[],
    name: string,
    description: string,
    run: (course: T, config?: ICanvasCallConfig) => Promise<ValidationResult<UserDataType>>
    fix?: (course: T) => Promise<ValidationResult<FixUserDataType>>
}

export interface CourseFixValidation<T = Course,
    UserDataType = unknown,
    FixUserDataType = UserDataType
>  extends CourseValidation<T, UserDataType, FixUserDataType> {
    fix: (course: T) => Promise<ValidationResult<FixUserDataType>>
}

export type TextReplaceValidation<T, UserData = unknown> = CourseValidation<T, UserData> & {
    negativeExemplars: string[][],
    positiveExemplars?: string[],
    fix: (course: T) => Promise<ValidationResult<UserData>>
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

export function testResult<UserData>(
    success: boolean | "unknown" | undefined, options?: TestResultOptions<UserData> ): ValidationResult<UserData> {
    success = success === 'unknown' ? success : !!success;
    let { failureMessage, notFailureMessage, links, userData} = {...testResultDefaults, ...options };

    failureMessage = ensureMessageResults(failureMessage);
    notFailureMessage = ensureMessageResults(notFailureMessage)

    const response: ValidationResult<UserData> = {
        success,
        messages: success ? notFailureMessage : failureMessage,
        userData

    }
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
    let matches = search.global ? Array.from(content.matchAll(search)) : [];
    search.lastIndex = 0;
    if (!search.global) {
        let match = search.exec(content);
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


export function badContentRunFunc(badTest: RegExp) {
    return async (course: IContentHaver, config?: ICanvasCallConfig) => {
        const defaultConfig = {queryParams: {include: ['body'], per_page: 50}};
        let content = await course.getContent(overrideConfig(config, defaultConfig));

        const badContent = content.filter(item => item.body && item.body.search(badTest) > -1)
        const syllabus = await course.getSyllabus(config);
        let syllabusTest = syllabus.search(badTest) > -1;
        const success = badContent.length === 0 && !syllabusTest;
        let links: string[] = [];
        let failureMessage: MessageResult[] = []

        if (badContent.length > 0) {
            let messageSets = badContent.map(a => {

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


export function badSyllabusFixFunc(validateRegEx: RegExp, replace: string | ((str: string, ...args: any[]) => string)) {
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

export function badContentFixFunc(validateRegEx: RegExp, replace: string | ((str: string, ...args: any[]) => string)) {
    return async (course: IContentHaver): Promise<ValidationResult<never>> => {
        let success = false;
        let messages: MessageResult[] = [];

        const errors = [];
        const includeBody = {queryParams: {include: ['body']}};
        let content = await course.getContent(includeBody);
        content = content.filter(item => item.body && item.body.search(validateRegEx) > -1);

        const replaceText = replaceTextFunc(validateRegEx, replace);
        await fixSyllabus(course, validateRegEx, replaceText);
        for (let item of content) {
            if (!item.body) continue;
            if (item.body.search(validateRegEx) === -1) continue;
            const newText = replaceText(item.body)
            if (newText.search(validateRegEx) > -1) throw new Error(`Fix broken for ${item.name})`);
            await item.updateContent(newText);
            messages.push()
        }

        return {
            success,
             messages
        }
    }
}



function replaceTextFunc(validateRegEx: RegExp, replace: string | ((text: string) => string)) {
    return (str: string) => {
        //This is silly, but it gets typescript to stop yelling at me about the overload
        if (typeof replace === 'string') return str.replaceAll(validateRegEx, replace)
        return str.replaceAll(validateRegEx, replace);
    }
}

async function fixSyllabus(course: ISyllabusHaver, validateRegEx: RegExp, replaceText: (text: string) => string) {
    const syllabus = await course.getSyllabus();
    if (syllabus.search(validateRegEx) > -1) {
        const newText = replaceText(syllabus);
        if (newText.search(validateRegEx) > -1) throw new Error("Fix broken for syllabus " + validateRegEx.toString() + newText);
        await course.changeSyllabus(newText);
    }

}

export function overrideConfig(
    source: ICanvasCallConfig | undefined,
    override: ICanvasCallConfig | undefined
) {

    return deepObjectMerge(source, override) ?? {} as ICanvasCallConfig;
}

export function errorMessageResult(e: unknown) {
    const bodyLines = [
        e?.toString() || 'Error',
    ]
    if (e && e instanceof Error && e.stack) bodyLines.push( e.stack);

    return { success:false, messages: [{bodyLines}]};
}