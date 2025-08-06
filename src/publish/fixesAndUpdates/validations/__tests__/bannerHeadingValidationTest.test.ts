import { bannerHeadingValidation } from '../bannerHeadingValidation';
import PageKind from '@/canvas/content/pages/PageKind';
import AssignmentKind from '@/canvas/content/assignments/AssignmentKind';
import { assignmentDataGen } from "@/canvas/content/assignments";

jest.mock('@/canvas/content/pages/PageKind');
jest.mock('@/canvas/content/assignments/AssignmentKind');
jest.mock('./utils', () => ({
    testResult: jest.fn((success, data) => ({ success, ...data })),
}));

const mockCourse = { id: 1 };
const mockConfig = {}; // why?

describe('bannerHeadingValidation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('run', () => {
        it('returns success when there are no invalid tags', async () => {
            const assignments: { body: string }[] = [{ body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1>Indicators of Health and Disease and Diagnostic Procedures</h1></div></div>' }];
            const pages: { body: string }[] = [{ body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1>Indicators of Health and Disease and Diagnostic Procedures</h1></div></div>' }];

            (assignmentDataGen as jest.Mock).mockResolvedValue(assignments);
            (PageKind.dataGenerator as jest.Mock).mockReturnValue(pages);

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
            const validationResult = { success: true, userData: {}, messages: ["not run"] };
            // if the run validation passed, the fix should not run
            if (!bannerHeadingValidation.fix) {
                throw new Error('bannerHeadingValidation.fix is undefined');
            }
            const result = await bannerHeadingValidation.fix(mockCourse, validationResult);



            // const result = await bannerHeadingValidation.fix(mockCourse, validationResult);
            // expect(result.success).toBe('not run');
            // expect(result.notFailureMessage).toBe('Fix not needed, validation passed.');
            
        });
            if (!bannerHeadingValidation.fix) {
                throw new Error('bannerHeadingValidation.fix is undefined');
            }
            const result = await bannerHeadingValidation.fix(mockCourse, validationResult);

            expect(result.success).toBe('unknown');
            expect(result.notFailureMessage).toBe('No user data to fix.');

            expect(result.success).toBe('unknown');
            expect(result.notFailureMessage).toBe('No user data to fix.');
        });

        it('fixes broken assignments and pages', async () => {
            const brokenAssignments = [
                { id: 1, body: '<div class="cbt-banner-header"><div><p>Title</p><p>Subtitle</p></div></div>' }
            ];
            const brokenPages = [
                { id: 2, body: '<div class="cbt-banner-header"><div><p>Title</p><h1><span>Subtitle</span></h1></div></div>' }
            if (!bannerHeadingValidation.fix) {
                throw new Error('bannerHeadingValidation.fix is undefined');
            }
            const result = await bannerHeadingValidation.fix(mockCourse, validationResult);

            expect(AssignmentKind.put).toHaveBeenCalled();
            expect(PageKind.put).toHaveBeenCalled();
            expect(result.success).toBe(false);
            expect(result.notFailureMessage).toBe('Banner not implemented yet.');
            const result = await bannerHeadingValidation.fix(mockCourse, validationResult);

            expect(AssignmentKind.put).toHaveBeenCalled();
            expect(PageKind.put).toHaveBeenCalled();
            expect(result.success).toBe(false);
            expect(result.notFailureMessage).toBe('Banner not implemented yet.');
        });
    });
});