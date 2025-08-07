import { bannerHeadingValidation } from '../bannerHeadingValidation';
import PageKind from '@/canvas/content/pages/PageKind';
import { assignmentDataGen } from "@/canvas/content/assignments";
import { mockAsyncGen } from "@/__mocks__/utils";
import { IPageData } from "@/canvas/content/pages/types";
import { mockPageData } from "@/canvas/content/__mocks__/mockContentData";
import { IAssignmentData } from "@/canvas";

jest.mock('@/canvas/content/pages/PageKind');
jest.mock('@/canvas/content/assignments/AssignmentKind');
jest.mock('../utils', () => ({
    testResult: jest.fn((success, data) => ({ success, ...data })),
}));

const mockCourse = { id: 1 };
const mockConfig = {}; // why?

   const mockNewPageData = (partial: Partial<IPageData> & {id: number})  => ({
                ...mockPageData,
                ...partial,
            });

const mockAssignmentData = (partial: Partial<IAssignmentData> & {id: number}) => ({
    ...mockAssignmentData,
    ...partial,
});


describe('bannerHeadingValidation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('run', () => {
        it('returns success when there are no invalid tags', async () => {
            const assignments: { body: string }[] = [{ body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1>Indicators of Health and Disease and Diagnostic Procedures</h1></div></div>' }];
            const pages: { body: string }[] = [{ body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1>Indicators of Health and Disease and Diagnostic Procedures</h1></div></div>' }];

          const assignmentGen = mockAsyncGen(assignments);
          const pagesGen = mockAsyncGen(pages);

            (assignmentDataGen as jest.Mock).mockReturnValue(assignmentGen);
            (PageKind.dataGenerator as jest.Mock).mockReturnValue(pagesGen);
            
            const result = await bannerHeadingValidation.run(mockCourse, mockConfig);
            expect(result.success).toBe(true);
            expect(result.userData).toEqual({ brokenAssignments: [], brokenPages: [] });
        });

        it('returns failure when there are invalid <span> tags in <h1>', async () => {
           const assignments: { body: string }[] = [{ body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1><span>Indicators of Health and Disease and Diagnostic Procedures</span></h1></div></div>' }];
           const pages: { body: string }[] = [{ body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1><span>Indicators of Health and Disease and Diagnostic Procedures</span></h1></div></div>' }];

            (assignmentDataGen as jest.Mock).mockResolvedValue(assignments);
            (PageKind.dataGenerator as jest.Mock).mockReturnValue(pages);

            const result = await bannerHeadingValidation.run(mockCourse, mockConfig);

            expect(result.success).toBe(false);
            expect(result.userData).toEqual({ brokenAssignments: [], brokenPages: [] });
        });

        it('returns failure when there are invalid <strong> tags in <h1>', async () => {
            const assignments: { body: string }[] = [{ body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1><strong>Indicators of Health and Disease and Diagnostic Procedures</strong></h1></div></div>' }];
            const pages: { body: string }[] = [{ body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1><strong>Indicators of Health and Disease and Diagnostic Procedures</strong></h1></div></div>' }];

            (assignmentDataGen as jest.Mock).mockResolvedValue(assignments);
            (PageKind.dataGenerator as jest.Mock).mockReturnValue(pages);

            const result = await bannerHeadingValidation.run(mockCourse, mockConfig);

            expect(result.success).toBe(false);
            expect(result.userData).toEqual({ brokenAssignments: [], brokenPages: [] });
        });

        it('returns failure when there are two <p> siblings', async () => {
            const assignments: { body: string }[] = [{ body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><p>Indicators of Health and Disease and Diagnostic Procedures</p></div></div>' }];
            const pages: { body: string }[] = [{ body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><p>Indicators of Health and Disease and Diagnostic Procedures</p></div></div>' }];

            (assignmentDataGen as jest.Mock).mockResolvedValue(assignments);
            (PageKind.dataGenerator as jest.Mock).mockReturnValue(pages);

            const result = await bannerHeadingValidation.run(mockCourse, mockConfig);

            expect(result.success).toBe(false);
            expect(result.userData).toEqual({ brokenAssignments: [], brokenPages: [] });
        });
    });

    describe('fix', () => {
        it('returns not run if validation passed', async () => {
            const validationResult = { success: true, userData: {}, messages: []};
            const result = await bannerHeadingValidation.fix(mockCourse, validationResult);
            expect(result.success).toBe('not run');            
        });
            
        it('fixes broken assignments and pages', async () => {
            const brokenAssignments = [
                { id: 1, body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><p>Indicators of Health and Disease and Diagnostic Procedures</strong></p></div></div>' }
            ];
            const brokenPages = [
                { id: 2, body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><p>Indicators of Health and Disease and Diagnostic Procedures</p></div></div>' }
            ];
            
            const validationResult = {
                success: false,
                userData: {
                    brokenAssignments: brokenAssignments.map(mockAssignmentData) as IAssignmentData[],
                    brokenPages: brokenPages.map(mockNewPageData) as IPageData[]
                },
                messages: []
            };
            const result = await bannerHeadingValidation.fix(mockCourse, validationResult);

            
            expect(result.userData).toEqual({
                fixedAssignments: brokenAssignments.map(mockAssignmentData),
                fixedPages: brokenPages.map(mockNewPageData)
            });
            expect(result.success).toBe(true);
            expect(result.messages).toEqual([
               "Banner heading updated successfully."
            ]);
            expect(result.userData?.brokenAssignments ?? []).toHaveLength(0);
            expect(result.userData?.brokenPages ?? []).toHaveLength(0);     
        });
    });
});

// do i need to show the fixed headings in the test?
/**
Issues:

the test suite is failing to run for bannerHeadingValidationTest.test.ts
 - The error may be related to the `fix` function in the `bannerHeadingValidation` module
 - The `ValidationResult` type is not being correctly handled in the `fix` function...maybe? The types of userData.brokenAssignments are not incompatible with IAssignmentData? 

 The types of userData.brokenAssignments are incompatible between these types
 validationResult is throwing a type error in the fix function test. 
 - Types of property 'name' are incompatible.
          - Type 'string | undefined' is not assignable to type 'string'.
          - Type 'undefined' is not assignable to type 'string'.
*/