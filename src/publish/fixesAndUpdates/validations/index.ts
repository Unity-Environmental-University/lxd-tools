import {Course, IContentHaver, ISyllabusHaver} from "../../../canvas/course/index";
import {deepObjectMerge, ICanvasCallConfig} from "../../../canvas/canvasUtils";

//number of characters to show around a match
const SHOW_WINDOW = 30;
const MAX_SEARCH_RETURN_SIZE = 100;
export type ValidationTestResult<UserDataType = undefined> = {
    userData?: UserDataType,
    success: boolean | 'unknown',
    message: string | string[],
    links?: string[],
}

export type ValidationFixResult = {
    success: boolean | 'unknown',
    message: string,
    links?: string[],
}



export type CourseValidation<T = Course, UserDataType = undefined> = {
    courseCodes?: string[],
    name: string,
    description: string,
    userData?: UserDataType,
    run: (course: T, config?: ICanvasCallConfig) => Promise<ValidationTestResult>
    fix?: (course: T) => Promise<ValidationFixResult>
}

export interface TextReplaceValidation<T = Course> extends CourseValidation<T> {
    negativeExemplars: string[][],
    positiveExemplars?: string[],
    fix: (course: T) => Promise<ValidationFixResult>
}

export function testResult(success: boolean | undefined, failureMessage: string[], links?: string[], successMessage = ['success']): ValidationTestResult {
    success = !!success;
    const response: ValidationTestResult = {
        success,
        message: success ? successMessage : failureMessage

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
        let failureMessage: string[] = []
        if (badContent.length > 0) {
            let messageSets = [...badContent.map(a => {
                if (!a.body?.length) return [a.name];
                const content = a.body;
                return matchHighlights(content, badTest)
            })]
            for (let messages of messageSets) failureMessage.push(...messages)
            links = [...links, ...badContent.map(a => a.htmlContentUrl)];
        }

        if (syllabusTest) {
            failureMessage.push(...matchHighlights(syllabus, badTest))
            links.push(`/courses/${course.id}/assignments/syllabus`)
        }

        const result = testResult(
            success,
            failureMessage,
            links
        )

        if (!success) result.links = badContent.map(content => content.htmlContentUrl)
        return result;
    }

}


export function badSyllabusFixFunc(validateRegEx: RegExp, replace: string | ((str: string, ...args: any[]) => string)) {
    const replaceText = replaceTextFunc(validateRegEx, replace);
    return async (course: ISyllabusHaver) => {
        try {
            await fixSyllabus(course, validateRegEx, replaceText);
            return {
                success: true,
                message: 'success'
            }
        } catch (e) {
            return {
                success: false,
                message: e instanceof Error? e.toString() : "An Error has occurred"
            }
        }

    }

}

export function badContentFixFunc(validateRegEx: RegExp, replace: string | ((str: string, ...args: any[]) => string)) {
    return async (course: IContentHaver): Promise<ValidationFixResult> => {
        let success = false;
        let message = "";

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
        }

        return {
            success,
            message
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

    return deepObjectMerge(source, override) ?? {} as ICanvasCallConfig ;
}