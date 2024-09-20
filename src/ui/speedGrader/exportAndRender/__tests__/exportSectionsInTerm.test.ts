import {saveDataGenFunc} from "@/ui/speedGrader/saveDataGenFunc";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {Course} from "@/canvas/course/Course";
import {Term} from "@/canvas/term/Term";
import {mockTermData} from "@/canvas/__mocks__/mockTermData";
import {getSections} from "@/canvas/course/blueprint";
import {exportSectionsInTerm} from "@/ui/speedGrader/exportAndRender/exportSectionsInTerm";
import {getRowsForSections} from "@/ui/speedGrader/getData/getRowsForSections";
import getCourseIdFromUrl from "@/canvas/course/getCourseIdFromUrl";
import mock = jest.mock;
import {getCourseData} from "@canvas/course";


jest.mock('@/canvas/course/blueprint');
jest.mock('@/canvas/course/index', () => ({
    getCourseData: jest.fn(),
    getCourseById: jest.fn(),
    getWorkingCourseData: jest.fn(() => ({
        ...mockCourseData,
        term: mockTermData,
    })),
}))
jest.mock('@/canvas/course/getCourseIdFromUrl', () => jest.fn(() => 1))
jest.mock('@/ui/speedGrader/saveDataGenFunc')
jest.mock('@/ui/speedGrader/getData/getRowsForSections')
jest.mock('@/canvas/Account')

describe('exportSectionsInTerm', () => {
    let mockCourse = new Course(mockCourseData)
    const mockTerm = new Term(mockTermData);
    const mockSections = [
        {...mockCourseData, id: 100},
        {...mockCourseData, id: 101},
        {...mockCourseData, id: 102},
    ].map(a => new Course(a));
    const getTermByIdSpy = jest.spyOn(Term, 'getTermById')
    getTermByIdSpy.mockResolvedValue(mockTerm);

    beforeEach(() => {
        jest.clearAllMocks();
        Course.getFromUrl = jest.fn(async () => mockCourse);
        Term.getTermById = jest.fn(async () => mockTerm)
        mockCourse = new Course(mockCourseData);
        mockCourse.getTerm = jest.fn(async () => mockTerm);
    });

    (getSections as jest.Mock).mockResolvedValue(mockSections)
    const mockRows = ['row1', 'row2', "row3"];
    const generatedSaveFunc = jest.fn();
    (saveDataGenFunc as jest.Mock).mockReturnValue(generatedSaveFunc);
    (getRowsForSections as jest.Mock).mockReturnValue(mockRows);

    it("Gets the course from Url if not provided", async() => {
        (getCourseData as jest.Mock).mockResolvedValue(mockCourseData);
        const rows = await exportSectionsInTerm();
        expect(getCourseIdFromUrl as jest.Mock).toHaveBeenCalled();
        expect(rows).toEqual(mockRows)
    })
    it("Does not get course from Url if course with term is provided", async() => {
        const rows = await exportSectionsInTerm({...mockCourseData, term: mockTermData});
        expect(getCourseIdFromUrl as jest.Mock).not.toHaveBeenCalled();
        expect(rows).toEqual(mockRows)
    })

    it("Works if term is provided in various forms", async() => {
        expect(await exportSectionsInTerm({...mockCourseData, term: mockTermData})).toEqual(mockRows);
        expect(await exportSectionsInTerm({...mockCourseData, term: mockTermData}, 1)).toEqual(mockRows);
        expect(await exportSectionsInTerm({...mockCourseData, term: mockTermData}, mockTerm)).toEqual(mockRows);
    })

})
