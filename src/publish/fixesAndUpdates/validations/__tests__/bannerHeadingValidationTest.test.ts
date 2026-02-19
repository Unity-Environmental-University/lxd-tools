import {bannerHeadingValidation} from '../bannerHeadingValidation';
import PageKind from '@ueu/ueu-canvas/content/pages/PageKind';
import {assignmentDataGen} from "@ueu/ueu-canvas/content/assignments";
import {mockAsyncGen} from "@/__mocks__/utils";
import {mockPageData} from "@ueu/ueu-canvas/content/__mocks__/mockContentData";
import {badContentTextValidationTest} from "../__mocks__/validations";
import {badContentTextValidationFixTest} from "../__mocks__/validations";
import {mockContentHaver} from "../__mocks__/validations";
import {Page} from "@ueu/ueu-canvas/content/pages/Page";
import {ContentTextReplaceFix, CourseValidation} from "@publish/fixesAndUpdates/validations/types";
import {IContentHaver} from "@ueu/ueu-canvas/course/courseTypes";
import {BaseContentItem} from "@ueu/ueu-canvas";

jest.mock('@/canvas/content/pages/PageKind');
jest.mock('@/canvas/content/assignments/AssignmentKind');
jest.mock('../utils', () => ({
    testResult: jest.fn((success, data) => ({success, ...data})),
    badContentRunFunc: jest.fn(),
    badContentFixFunc: jest.fn(),
    run: jest.fn(),
    fix: jest.fn(),
}));

const mockCourse = {id: 1};
const mockConfig = {}; // why?

describe('bannerHeadingValidation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('run', () => {
        it('returns success when there are no invalid tags', async () => {
            const assignments: {
                body: string
            }[] = [{body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1>Indicators of Health and Disease and Diagnostic Procedures</h1></div></div>'}];
            const pages: {
                body: string
            }[] = [{body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1>Indicators of Health and Disease and Diagnostic Procedures</h1></div></div>'}];

            const assignmentGen = mockAsyncGen(assignments);
            const pagesGen = mockAsyncGen(pages);

            (assignmentDataGen as jest.Mock).mockReturnValue(assignmentGen);
            (PageKind.dataGenerator as jest.Mock).mockReturnValue(pagesGen);

            const result = await bannerHeadingValidation.run(mockCourse, mockConfig);
            expect(result.success).toBe(true);
            expect(result.userData).toEqual({brokenAssignments: [], brokenPages: []});
        });

        it('returns failure when there are invalid <span> tags in <h1>', async () => {
            const assignments: {
                body: string
            }[] = [{body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1><span>Indicators of Health and Disease and Diagnostic Procedures</span></h1></div></div>'}];
            const pages: {
                body: string
            }[] = [{body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1><span>Indicators of Health and Disease and Diagnostic Procedures</span></h1></div></div>'}];

            const assignmentGen = mockAsyncGen(assignments);
            const pagesGen = mockAsyncGen(pages);
            (assignmentDataGen as jest.Mock).mockReturnValue(assignmentGen);
            (PageKind.dataGenerator as jest.Mock).mockReturnValue(pagesGen);

            const result = await bannerHeadingValidation.run(mockCourse, mockConfig);

            expect(result.success).toBe(false);
            expect(result.userData).toBeDefined();
        });

        it('returns failure when there are invalid <strong> tags in <h1>', async () => {
            const assignments: {
                body: string
            }[] = [{body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1><strong>Indicators of Health and Disease and Diagnostic Procedures</strong></h1></div></div>'}];
            const pages: {
                body: string
            }[] = [{body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><h1><strong>Indicators of Health and Disease and Diagnostic Procedures</strong></h1></div></div>'}];

            const assignmentGen = mockAsyncGen(assignments);
            const pagesGen = mockAsyncGen(pages);
            (assignmentDataGen as jest.Mock).mockReturnValue(assignmentGen);
            (PageKind.dataGenerator as jest.Mock).mockReturnValue(pagesGen);

            const result = await bannerHeadingValidation.run(mockCourse, mockConfig);

            expect(result.success).toBe(false);
            expect(result.userData).toBeDefined();
        });

        it('returns failure when there are two <p> siblings', async () => {
            const assignments: {
                body: string
            }[] = [{body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><p>Indicators of Health and Disease and Diagnostic Procedures</p></div></div>'}];
            const pages: {
                body: string
            }[] = [{body: '<div class="cbt-banner-header"><div><p>Week 1 Overview</p><p>Indicators of Health and Disease and Diagnostic Procedures</p></div></div>'}];

            const assignmentGen = mockAsyncGen(assignments);
            const pagesGen = mockAsyncGen(pages);
            (assignmentDataGen as jest.Mock).mockReturnValue(assignmentGen);
            (PageKind.dataGenerator as jest.Mock).mockReturnValue(pagesGen);

            const result = await bannerHeadingValidation.run(mockCourse, mockConfig);

            expect(result.success).toBe(false);
            expect(result.userData).toBeDefined();
        });
    });

    describe('fix', () => {
        it('returns not run if validation passed', async () => {
            const validationResult = {success: true, userData: {brokenAssignments: [], brokenPages: []}, messages: []};
            const result = await bannerHeadingValidation.fix(mockCourse, validationResult);
            expect(result.success).toBe('not run');
        });


        describe("Replace old banner heading", () => {
            expect(Array.isArray(bannerHeadingValidation.beforeAndAfters)).toBe(true);

            for (const [bad, good] of bannerHeadingValidation.beforeAndAfters) {
                it(`fixes bad to good in beforeAndAfters`, () => {
                    badContentTextValidationFixTest(
                        bannerHeadingValidation as ContentTextReplaceFix<any, any>,
                    )
                });
            }
        });
    });
});
