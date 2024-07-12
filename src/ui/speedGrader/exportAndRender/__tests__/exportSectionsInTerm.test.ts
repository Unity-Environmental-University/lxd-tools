import {saveDataGenFunc} from "@/ui/speedGrader/saveDataGenFunc";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {Course} from "@/canvas/course/Course";
import {Term} from "@/canvas/Term";
import {mockTermData} from "@/canvas/__mocks__/mockTermData";
import {getSections} from "@/canvas/course/blueprint";
import {exportSectionsInTerm} from "@/ui/speedGrader/exportAndRender/exportSectionsInTerm";
import {getRowsForSections} from "@/ui/speedGrader/getData/getRowsForSections";
import mock = jest.mock;


jest.mock('@/canvas/course/blueprint');
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
        const rows = await exportSectionsInTerm();
        expect(Course.getFromUrl as jest.Mock).toHaveBeenCalled();
        expect(rows).toEqual(mockRows)
    })
    it("Does not get course from Url if course is provided", async() => {
        const rows = await exportSectionsInTerm(mockCourse);
        expect(Course.getFromUrl as jest.Mock).not.toHaveBeenCalled();
        expect(rows).toEqual(mockRows)
    })

    it("Works if term is provided in various forms", async() => {
        expect(await exportSectionsInTerm(mockCourse)).toEqual(mockRows);
        expect(await exportSectionsInTerm(mockCourse, 1)).toEqual(mockRows);
        expect(await exportSectionsInTerm(mockCourse, mockTerm)).toEqual(mockRows);
    })

})

// export async function exportSectionsInTerm(course: Course | null = null, term: Term | number | null = null) {
//
//     course ??= await Course.getFromUrl();
//     assert(course)
//     if (typeof term === "number") {
//         term = await Term.getTermById(term);
//     } else {
//         term ??= await course?.getTerm();
//     }
//
//     assert(term);
//     assert(course);
//
//     let sections = await getSections(course);
//     const allSectionRows: string[] = sections ? await getRowsForSections(sections) : [];
//
//     console.log("Writing Final Output Document...")
//     saveDataGenFunc()(allSectionRows, `${term.name} ${course.baseCode} All Sections.csv`);
//     return allSectionRows;
// }