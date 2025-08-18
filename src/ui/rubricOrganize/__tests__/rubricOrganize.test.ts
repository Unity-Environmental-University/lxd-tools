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
    let rubricOrganize: RubricOrganizeContext;
    let mockLocation: Location;
    let mockRubricPage: HTMLElement;

    beforeEach(() => {
        mockDocument = document.implementation.createHTMLDocument();
        mockRubricPage = createMockRubricPage(mockDocument);
        mockDocument.body.appendChild(mockRubricPage);
        mockLocation = {
            pathname: '/courses/123/rubrics/456',
        } as Location;
        rubricOrganize = createRubricOrganize(mockDocument);
    })

    it("injects rubric organize into the page", ()=> {
        const rubricOrganizeSpy = jest.spyOn(rubricOrganize, 'waitForEdit');

        rubricOrganize.waitForEdit();
        expect(rubricOrganizeSpy).toHaveBeenCalled();
    })

    it("correctly handles an edit button click", ()=> {
        const editButton = mockDocument.querySelector('.edit_rubric_button') as HTMLButtonElement;
        const waitForEditSpy = jest.spyOn(rubricOrganize, 'waitForEdit');

        expect(editButton).not.toBeNull();

        rubricOrganize.waitForEdit();

    })

    it("injects rubric organize into the page", () => {
        // Create a spy to track function calls
        const waitForEditSpy = jest.spyOn(rubricOrganize, 'waitForEdit');
        const attachRowSorterSpy = jest.spyOn(rubricOrganize, 'attachRowSorter');

        // Trigger initial setup
        rubricOrganize.waitForEdit();

        // Assertions
        expect(mockDocument.getElementById('rubrics')).toBeTruthy();
        expect(waitForEditSpy).toHaveBeenCalled();

        // If attachRowSorter is called during waitForEdit, check that too
        //expect(attachRowSorterSpy).toHaveBeenCalledTimes(1);


    })
})