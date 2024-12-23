import {addSyllabusSectionFix} from "@publish/fixesAndUpdates/validations/utils";
import {ISyllabusHaver} from "@canvas/course/courseTypes";
import {mockCourseData} from "@canvas/course/__mocks__/mockCourseData";


describe("addSyllabusSectionFix", () => {
    let mockCourse: ISyllabusHaver;
    const mockSyllabusHtml = `<div>
        <div>
            <h3>Section Name</h3>
            <p>Line 1</p>
            <p>Line 2</p>
        </div>
    </div>`;

    const defaultMockCourseData = {...mockCourseData};
    beforeEach(() => {
        jest.resetAllMocks()
        mockCourse = {
            id: defaultMockCourseData.id,
            changeSyllabus: jest.fn(),
            getSyllabus: jest.fn(),
        }
    });

    function elsAndSpys(mockHtml = mockSyllabusHtml) {
        const changeSpy = jest.spyOn(mockCourse, 'changeSyllabus');
        const syllabusEl = document.createElement('div');
        syllabusEl.innerHTML = mockHtml;
        const sectionEl = syllabusEl.querySelector('h3')!.parentElement;
        const userData = {
            syllabusEl,
            sectionEl,
        };

        return {
            changeSpy,
            syllabusEl,
            sectionEl,
            userData
        }


    }

    test('adds to end', async () => {
        const fix = addSyllabusSectionFix(`<p>Added Section</p>`);
        const {changeSpy, userData} = elsAndSpys(mockSyllabusHtml);
        changeSpy.mockResolvedValueOnce({...mockCourse})
        const result = await fix(mockCourse, {
            success: false,
            messages: [],
            userData,
        });
        expect(result.success).toBeTruthy();
        expect(changeSpy).toHaveBeenCalledWith(`<div>
        <div>
            <h3>Section Name</h3>
            <p>Line 1</p>
            <p>Line 2</p><p>Added Section</p>
        </div>
    </div>`
        )
    });

    test('adds to beginning', async () => {
        const fix = addSyllabusSectionFix(`<p>Added Section</p>`, false);
        const {changeSpy, userData} = elsAndSpys(mockSyllabusHtml);
        changeSpy.mockResolvedValueOnce({...mockCourse})
        const result = await fix(mockCourse, {
            success: false,
            messages: [],
            userData,
        });
        expect(result.success).toBeTruthy();
        expect(changeSpy).toHaveBeenCalledWith(`<div>
        <div>
            <h3>Section Name</h3><p>Added Section</p>
            <p>Line 1</p>
            <p>Line 2</p>
        </div>
    </div>`
        )


    });
})