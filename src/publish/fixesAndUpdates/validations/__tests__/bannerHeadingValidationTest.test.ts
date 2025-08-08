import { bannerHeadingValidation } from '../bannerHeadingValidation';
import PageKind from '@/canvas/content/pages/PageKind';
import { assignmentDataGen } from "@/canvas/content/assignments";
import { mockAsyncGen } from "@/__mocks__/utils";
// import { IPageData } from "@/canvas/content/pages/types";
import { mockPageData } from "@/canvas/content/__mocks__/mockContentData";
// import { IAssignmentData } from "@/canvas";
// import technologyLinkTest from "../courseContent/technologyForSuccess";
import { badContentTextValidationTest } from "../__mocks__/validations";
import { badContentTextValidationFixTest } from "../__mocks__/validations";
import { mockContentHaver } from "../__mocks__/validations";
import { Page } from "@/canvas/content/pages/Page";

jest.mock('@/canvas/content/pages/PageKind');
jest.mock('@/canvas/content/assignments/AssignmentKind');
jest.mock('../utils', () => ({
    testResult: jest.fn((success, data) => ({ success, ...data })),
     badContentRunFunc: jest.fn(),
    badContentFixFunc: jest.fn(),
    run: jest.fn(),
    fix: jest.fn(),
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


    describe("Replace old banner heading", () => {
      for (const [bad, good] of bannerHeadingValidation.beforeAndAfters) {
          test(`Text works ${bad}, ${good}`, badContentTextValidationTest(bannerHeadingValidation, bad, good));
      }
  
            test('Fix Works', badContentTextValidationFixTest(
                bannerHeadingValidation,
                (badText: string, goodText: string) => [
                    mockContentHaver(goodText, [new Page({
                        ...mockPageData,
                        name: 'Course Overview',
                        body: badText,
                    }, 0)], 'Course Overview Haver')
                ]
            ))
        });
    });
});
