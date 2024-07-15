import {capitalize, matchHighlights, preserveCapsReplace, testResult} from "../index";
import {BaseContentItem} from "@/canvas/content/baseContentItem";


jest.spyOn(BaseContentItem.prototype, 'saveData')
    .mockImplementation(async (data) => {
        return data
    });


test('caps replace test', () => {

    expect(capitalize("moose munch")).toBe("Moose Munch")
    expect(capitalize("moose Munch")).toBe("Moose Munch")
    expect(capitalize("moose MuncH")).toBe("Moose MuncH")
    expect(capitalize("moose MuncH")).toBe("Moose MuncH")
    let replacement = "Hello hello There".replace(/hello/ig, preserveCapsReplace(/hello/ig, 'goodbye'))
    expect(replacement).toBe('Goodbye goodbye There');

    replacement = "HELLO HELLO THERE".replace(/hello/ig, preserveCapsReplace(/hello/ig, 'goodbye'))
    expect(replacement).toBe('GOODBYE GOODBYE THERE');

    replacement = "Whoopsie".replace(/wh(oops)/ig, preserveCapsReplace(/wh(oops)/ig, '$1'))
    expect(replacement).toBe('Oopsie');
    //Does not currently support capture groups

})

test('match hilights test', () => {
    expect(matchHighlights("bob", /bob/g, 2, 1)).toStrictEqual(['b...b']);
    expect(matchHighlights("bob", /o/g, 3, 1)).toStrictEqual(['bob']);
    expect(matchHighlights("bob", /b/g, 2, 1)).toStrictEqual(['bo', 'ob']);

})

describe('testResult', () => {
    const failure = 'failure';
    const success = 'success';

    const failureMessageBodyLines = [failure, failure];
    const successMessageBodyLines = [success, success];
    const failureMessage = {bodyLines: failureMessageBodyLines}
    const notFailureMessage = {bodyLines: successMessageBodyLines}

    const links = ['http://localhost:8080']

    const validFailResult = {
        success: false,
        messages: [failureMessage],
        links,
    }
    const validSuccessResult = {...validFailResult, success: true, messages:[notFailureMessage]}

    it('returns failureMessage on a failed result', () => {
        expect(testResult(false, {failureMessage, links, notFailureMessage})).toEqual(validFailResult)
    })
    it('returns successMessage on a successful result', () => {
        expect(testResult(true, {failureMessage, links, notFailureMessage})).toEqual(validSuccessResult)
    })

    it('correctly interprets a single string passed in for success and failure', () => {
        expect(testResult(false, {failureMessage: failure, links, notFailureMessage: success}))
            .toEqual({...validFailResult, messages: [{bodyLines:[failure]}]})

        expect(testResult(true, {failureMessage: failure, links, notFailureMessage: success}))
            .toEqual({...validSuccessResult, messages: [{bodyLines:[success]}]})
    })

    it('correctly interprets a list of strings passed in for success and failure', () => {
        expect(testResult(false, {
            failureMessage: failureMessageBodyLines, links, notFailureMessage: successMessageBodyLines
        })).toEqual(validFailResult)
        expect(testResult(true, {
            failureMessage: failureMessageBodyLines, links, notFailureMessage: successMessageBodyLines
        })).toEqual(validSuccessResult)
    })

})
