import assert from "assert";
import {Dict} from "./canvasDataDefs";

//NONE OF THIS IS TESTED SINCE REFACTOR

interface IContentTest{
    message?: string
    userdata?: Dict
    (pageBody: string) : boolean | RegExpMatchArray | null
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
    find: string | RegExp,
    replace?: string | ((pageBody: string, match: RegExpMatchArray) => string),
    overwrite? : string | ((pageBody: string, match: RegExpMatchArray) => string),
    successTests: IContentTest[],
    failureTests?: IContentTest[]
}


export class ContentFix implements IContentFixInit{
    public find;
    replace?;
    overwrite?;
    successTests;
    failureTests?;


    constructor(init: IContentFixInit) {
        assert(this.overwrite || this.replace, "Replacements must either have a fix OR replace property.")
        this.find = init.find;
        this.replace = init.replace;
        this.successTests = init.successTests;
        this.failureTests = init.failureTests;
        this.overwrite = init.overwrite;
    }

    static inTest(toMatch: string | RegExp, message?: string): IContentTest {
        return function (this: IContentTest, text: string) {
            this.message = message ?? `${toMatch.toString()}`;
            if (toMatch instanceof RegExp) {
                return toMatch.exec(text)
            }
            else return text.includes(toMatch);
        }
    }

    static notInTest(toMatch: string | RegExp, message?: string) : IContentTest {
        return function (this: IContentTest, text: string) {
            this.message = message ?? `NOT ${toMatch.toString()}`;
            if (toMatch instanceof RegExp) {
                if(toMatch.exec(text)) return false;
            } else {
                return !text.includes(toMatch);
            }
            //We should never get here, but it stops typescript from being sad
            return null;
        }
    }

    checkTests(
        text: string,
        testSet: IContentTest[] | null = null,
        onFail: ((contentTest: IContentTest) => void) | null = null
    ): {success: boolean, testsFailed?: IContentTest[], testsSucceeded: IContentTest[]} {
        const testsFailed: IContentTest[] = [];
        const testsSucceeded: IContentTest[] = [];
        for (let test of testSet ?? this.successTests) {
            //Create a new context for the test so we're not polluting the tests themselves
            //At this point I really should just be making them their own classlike
            const result = test.call({}, text);
            if (!result) {
                if (onFail) {
                    onFail(test);
                }
                testsFailed.push(test);
            }
        }
        return {success: testsFailed.length > 0, testsFailed, testsSucceeded};
    }


    fix(sourceText: string) {
        const noNeedToRun = this.checkTests(sourceText, this.successTests);
        let outText: string | null = null;
        if (noNeedToRun) {
            console.log(`all tests passed, no need to apply fix ${this.find}`);
            return null;
        }

        const match = sourceText.match(this.find);
        if (!match) {
            return null;
        }

        // This is already handled in the constructor but just in case;

        //We run replace before fix if for some mysterious reason we ever need to do both.
        // For now setting both is disabled in the constructor.
        if(this.replace) {
            if (typeof this.replace === 'function') {
                outText = this.replace(sourceText, match);
            } else {
                outText = sourceText.replace(this.find, this.replace);
            }
        }

        if(this.overwrite) {
            if (typeof this.overwrite === 'function') {
                outText = this.overwrite(sourceText, match);
            } else {
                outText = this.overwrite;
            }
        }
        //We haven't changed anything so return null

        if(!outText) return null;

        const failureTestResult = this.checkTests(outText, this.failureTests);
        const successTestResult = this.checkTests(outText, this.successTests);
        if (!successTestResult.success || failureTestResult.success) {
            let messages: string[] = [];
            if(successTestResult.testsFailed) {
                messages = messages.concat(successTestResult.testsFailed.map(result => "DID NOT PASS " + result.message))
            }
            if(failureTestResult) {
                messages = messages.concat(failureTestResult.testsSucceeded.map(result => "SHOULD NOT HAVE PASSED " + result.message))
            }
            let exception = new ReplaceException(messages.join('\n'));

            throw new ReplaceException(messages.join('\n'));
        }
        return outText;
    }
}

export class FixSet {
    fixes;
    constructor(fixes: ContentFix[]) {
        this.fixes = fixes;
    }
    fix(sourceText: string) {
        let outText = sourceText;
        for (let contentFix of this.fixes) {
            console.log(`Running ${contentFix.find} --> ${contentFix.replace}`);
            const fixedText = contentFix.fix(outText);
            if (fixedText) {
                outText = fixedText;
            }
        }
        return outText;
    }
}

export class ReplaceException extends Error {
    testsFailed: IContentTest[] | null = null;
    testsSucceeded: IContentTest[] | null = null;
}
