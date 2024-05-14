import {Course, IContentHaver} from "../../../canvas/course/index";
import {ICanvasCallConfig} from "../../../canvas/canvasUtils";

//number of characters to show around a match
const SHOW_WINDOW = 5;
const MAX_SEARCH_RETURN_SIZE = 20;
export type ValidationTestResult = {
    success: boolean | 'unknown',
    message: string,
    links?: string[],
}

export type ValidationFixResult = {
    success: boolean | 'unknown',
    message: string,
    links?: string[],
}

export type CourseValidationTest<T = Course> = {
    courseCodes?: string[],
    name: string,
    description: string,
    run: (course: T, config?: ICanvasCallConfig) => Promise<ValidationTestResult>
    fix?: (course: T) => Promise<ValidationFixResult>
}

export function testResult(success: boolean, failureMessage: string, links?: string[], successMessage = 'success'): ValidationTestResult {
    const response: ValidationTestResult = {
        success,
        message: success ? successMessage : failureMessage

    }
    if (links) response.links = links;
    return response;
}


export function capitalize(str:string) {
    return str.replace(/\b[a-z]/g, (substring: string) => substring.toUpperCase());
}
export function preserveCapsReplace(replace:string) {
    return (substring:string, ..._args:any[]) => {
        if(substring.toUpperCase() === substring) return replace.toUpperCase();
        if(capitalize(substring) === substring) return capitalize(replace);
        return replace;
    }
}

export function matchHighlights(content:string, search:RegExp, maxHighlightLength = MAX_SEARCH_RETURN_SIZE, windowSize = SHOW_WINDOW) {


    search.lastIndex = 0;
    let matches = search.global ?  Array.from(content.matchAll(search)) : [];
    search.lastIndex = 0;
    if(!search.global) {
        let match = search.exec(content);
        if(match) matches.push(match);
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
        const includeBody = {queryParams: {include: ['body']}};
        let content = await course.getContent(overrideConfig(config, includeBody));
        for (let item of content) {
            //console.log(item.name, item.constructor.name, item.body, item.body && badTest.exec(item.body));
        }

        const bodies = content.map(item => item.body);
        const testResults = content.map(item => item.body && item.body.search(badTest));
        const badContent = content.filter(item => item.body && item.body.search(badTest) > -1)
        const syllabus = await course.getSyllabus(config);
        const syllabusTest = syllabus.search(badTest) > -1;
        const success = badContent.length === 0 && !syllabusTest;
        let links: string[] = [];
        let failureMessage = '';
        if (badContent.length > 0) {
            failureMessage += "Bad content found:" + badContent.map(a => {
                if(!a.body?.length) return a.name;
                const content = a.body;
                return matchHighlights(content, badTest)


            }).join('\n')
            links = [...links, ...badContent.map(a => a.htmlContentUrl)];
        }
        if (syllabusTest) {
            failureMessage += 'Syllabus broken'
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

export function badContentFixFunc(validateRegEx: RegExp, replace:string|((str:string, ...args:any[])=>string)) {
    return async (course: IContentHaver): Promise<ValidationFixResult> => {
        let success = false;
        let message = "Fix failed for unknown reasons";

        const errors = [];
        const includeBody = {queryParams: {include: ['body']}};
        let content = await course.getContent(includeBody);
        content = content.filter(item => item.body && validateRegEx.exec(item.body));

        const replaceText = (str:string) => {
            //This is silly, but it gets typescript to stop yelling at me about the overload
            if (typeof replace === 'string') return str.replaceAll(validateRegEx, replace)
            return str.replaceAll(validateRegEx, replace);
        }

        const syllabus = await course.getSyllabus();
        if (validateRegEx.exec(syllabus)) {
            const newText = replaceText(syllabus);
            if (validateRegEx.exec(newText)) throw new Error("Fix broken for syllabus " + validateRegEx.toString());
            await course.changeSyllabus(newText);
        }

        for (let item of content) {
            if (!item.body) continue;
            if (!validateRegEx.exec(item.body)) continue;
            const newText = replaceText(item.body)
            if (validateRegEx.exec(newText)) throw new Error(`Fix broken for ${item.name})`);
            await item.updateContent(newText);
        }


        return {
            success,
            message
        }
    }
}

export function overrideConfig(source: ICanvasCallConfig | undefined, override: ICanvasCallConfig | undefined): ICanvasCallConfig {
    const out = {
        queryParams: {
            ...source?.queryParams,
            ...override?.queryParams,
        },
        fetchInit: {...source?.fetchInit, ...override?.fetchInit}
    }

    if (source?.queryParams?.include && override?.queryParams?.include) {
        out.queryParams.include = [...source?.queryParams.include, ...override?.queryParams.include]
    }

    return out;
}