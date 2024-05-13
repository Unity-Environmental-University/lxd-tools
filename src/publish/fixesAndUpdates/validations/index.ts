import {Course, IContentHaver} from "../../../canvas/course/index";
import {ICanvasCallConfig} from "../../../canvas/canvasUtils";

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

export function badContentRunFunc(badTest: RegExp) {
    return async (course: IContentHaver, config?: ICanvasCallConfig) => {
        const includeBody = {queryParams: {include: ['body']}};
        let content = await course.getContent(overrideConfig(config, includeBody));
        for (let item of content) {
            console.log(item.name, item.constructor.name, item.body, item.body && badTest.test(item.body));
        }

        const badContent = content.filter(item => item.body && badTest.test(item.body))

        const syllabus = await course.getSyllabus(config);
        const success = badContent.length === 0 && !badTest.test(syllabus);
        let links: string[] = [];
        let failureMessage = '';
        if (badContent.length > 0) {
            failureMessage += "Bad content found:" + badContent.map(a => a.name).join(',') + '\n'
            links = [...links, ...badContent.map(a => a.htmlContentUrl)];
        }
        if (badTest.test(syllabus)) {
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

export function badContentFixFunc(validateRegEx: RegExp, replace: string) {
    return async (course: IContentHaver): Promise<ValidationFixResult> => {
        let success = false;
        let message = "Fix failed for unknown reasons";

        const errors = [];
        const includeBody = {queryParams: {include: ['body']}};
        let content = await course.getContent(includeBody);
        content = content.filter(item => item.body && validateRegEx.test(item.body));

        const syllabus = await course.getSyllabus();
        if (validateRegEx.test(syllabus)) {
            const newText = syllabus.replace(validateRegEx, replace);
            if (validateRegEx.test(newText)) throw new Error("Fix broken for syllabus " + validateRegEx.toString());
            await course.changeSyllabus(newText);
        }

        for (let item of content) {
            if (!item.body) continue;
            if (!validateRegEx.test(item.body)) continue;
            const newText = item.body.replace(validateRegEx, replace);
            if (validateRegEx.test(newText)) throw new Error(`Fix broken for ${item.name})`);
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