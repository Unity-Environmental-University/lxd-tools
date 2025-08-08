import { createRubricOrganize, RubricOrganizeContext, pageRegex } from "@/ui/rubricOrganize/rubricOrganize";
import {createMockRubricPage, injectMockRubric} from "@/ui/rubricOrganize/__mocks__/mockRubricPage";
import Mock = jest.Mock;

describe('regex matches urls for rubrics', () =>{
    it("matches urls for rubrics", () => {
        expect(pageRegex.test('/courses/123/rubrics/456')).toBe(true);
        expect(pageRegex.test('/courses/123/rubrics/456/edit')).toBe(true);
    })

    it("doesn't match urls for other pages", () => {
        expect(pageRegex.test('/courses/123/assignments/456')).toBe(false);
        expect(pageRegex.test('/courses/123/assignments/456/edit')).toBe(false);
    })
})

describe("Testing rubric organize", () => {
    let mockDocument: Document;

    beforeEach(() => {
        mockDocument = document.implementation.createHTMLDocument();
    })

    it("injects rubric organize into the page", () => {
        const mockRubricPage = createMockRubricPage(mockDocument);
        mockDocument.body.appendChild(mockRubricPage);

        // Create a spy to track function calls
        const waitForEditSpy = jest.spyOn(RubricOrganizeContext.prototype, 'waitForEdit');
        const attachRowSorterSpy = jest.spyOn(RubricOrganizeContext.prototype, 'attachRowSorter');

        // Create rubric organize context
        const rubricOrganize = createRubricOrganize(mockDocument);

        // Trigger initial setup
        rubricOrganize.waitForEdit();

        // Assertions
        expect(mockDocument.getElementById('rubrics')).toBeTruthy();
        expect(waitForEditSpy).toHaveBeenCalled();

        // If attachRowSorter is called during waitForEdit, check that too
        expect(attachRowSorterSpy).toHaveBeenCalledTimes(1);


    })
})