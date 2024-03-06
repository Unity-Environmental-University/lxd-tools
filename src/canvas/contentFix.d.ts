import { Dict } from "./canvasDataDefs";
interface IContentTest {
    message?: string;
    userdata?: Dict;
    (pageBody: string): boolean | RegExpMatchArray | null;
}
/**
 * @param find A string to find in the text to replace
 * @param replace Text to replace the 'find' string with, accepts match groups from find regex. Can also be a function
 * that takes in the original found string and returns a different string.
 * @param successTests A list of functions taking in the whole page body and return true or false if the page matches
 * the conditions the page should after test.
 * The replacement will not run if all of these conditions would be met as we assume the fixes have already been made.
 * The replacement will revert if any of these conditions are false after the replacement is initially run.
 * @param failureTests optional A list of tests that only run after the replacement has been attempted. If any of these
 * return true, this replacement is reverted.
 */
interface IContentFixInit {
    find: string | RegExp;
    replace?: string | ((pageBody: string, match: RegExpMatchArray) => string);
    overwrite?: string | ((pageBody: string, match: RegExpMatchArray) => string);
    successTests: IContentTest[];
    failureTests?: IContentTest[];
}
export declare class ContentFix implements IContentFixInit {
    find: string | RegExp;
    replace?: string | ((pageBody: string, match: RegExpMatchArray) => string) | undefined;
    overwrite?: string | ((pageBody: string, match: RegExpMatchArray) => string) | undefined;
    successTests: IContentTest[];
    failureTests?: IContentTest[] | undefined;
    constructor(init: IContentFixInit);
    static inTest(toMatch: string | RegExp, message?: string): IContentTest;
    static notInTest(toMatch: string | RegExp, message?: string): IContentTest;
    checkTests(text: string, testSet?: IContentTest[] | null, onFail?: ((contentTest: IContentTest) => void) | null): {
        success: boolean;
        testsFailed?: IContentTest[];
        testsSucceeded: IContentTest[];
    };
    fix(sourceText: string): string | null;
}
export declare class FixSet {
    fixes: ContentFix[];
    constructor(fixes: ContentFix[]);
    fix(sourceText: string): string;
}
export declare class ReplaceException extends Error {
    testsFailed: IContentTest[] | null;
    testsSucceeded: IContentTest[] | null;
}
export {};
