export type ContentFix<T = string> = {
    preflightTests?: ((potentialOutput: T) => boolean)[],
    tests?: ((potentialOutput: T) => boolean)[],
    run: (value: T) => T
}

export type FixFailureResult<T> = {
    failedFixes: ContentFix<T>[],
    output: T
}
/**
 * Runs through a series of Content Fixes. If all is well, passes the results into the next
 * content fix.
 * Each ContentFix can have tests and preflight tests. Preflight tests are run before the fix is attempted
 * Tests are fun after.
 * If any of these tests fail, that content fix is not run on the text, instead passing the previous value.
 * @param fixes
 * @param source
 */
export function runReplacements<T extends {toString:()=>string} = string>(fixes: ContentFix<T>[], source: T) {
const failedFixes: ContentFix<T>[]= [];
    const output: T = fixes.reduce((accumulator, {run, tests, preflightTests}) => {
        // run through all preflight tests, if any of them fail, return the pre-transformation value
        if (preflightTests && preflightTests.map((test) => test(output)).includes(false)) return accumulator;
        const output = run(accumulator);
        // run through all tests, if any of them fail, return the pre-transformation value
        if (tests && tests.map((test) => test(output)).includes(false)) {
            failedFixes.push({run, tests, preflightTests})
            return accumulator;
        }
        return output;
    }, source);

    return {failedFixes, output} as FixFailureResult<T>;
}

export function findReplaceFunc(find:string|RegExp, replace:string) {
    return (source: string) => {
        const output = source.replace(find, replace);
        return output;
    };
}

/**
 * Returns a function that returns true if passed a string that contains the find value or matches the find RegEx, false otherwise
 * @param find A regular expression to check the input string against, or a substring to check if the input string contains
 * @param caseSensitive (string find only) whether to match the string case sensitive-ly
 */
export function inTest(find:string|RegExp, caseSensitive=true) {
    if(typeof find === "string") {
        const findValue = caseSensitive ? find : find.toLowerCase();
        return (source: string) => (caseSensitive ? source : source.toLowerCase()).includes(findValue);
    } else {
        return (source:string) => {


            return !!source.match(find);
        }
    }
}

/**
 * Returns a function that returns false if passed a string that contains the find value or matches the find RegEx, true otherwise
 * @param find A regular expression to check the input string against, or a substring to check if the input string contains
 * @param caseSensitive (string find only) whether to match the string case sensitive-ly
 */
export function notInTest(find: string|RegExp, caseSensitive = true) {
    if(typeof find === "string") {
        const findValue = caseSensitive ? find : find.toLowerCase();
        return (source: string) => {
            return !((caseSensitive ? source : source.toLowerCase()).includes(findValue));
        }
    } else {
        return (source:string) => {

            return !source.match(find);
        }
    }
}