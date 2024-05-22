//We should really write integration tests for these eventually rather than just unit tests


import { range } from "../../../src/canvas/canvasUtils";
import {
    getAssociatedCourses,
    getTermNameFromSections,
    IBlueprintCourse,
    isBlueprint,
    retireBlueprint
} from "../../../src/canvas/course/blueprint";
import {dummyCourseData} from "../../publish/fixesAndUpdates/dummyCourseData";
import fetchMock from "jest-fetch-mock";
import {Course} from "../../../src/canvas/course/index";
import {ICourseData} from "../../../src/canvas/canvasDataDefs";

fetchMock.enableMocks();
function getDummyBlueprintCourse (blueprint: boolean, id:number = 0) {
    let out: IBlueprintCourse;
    out = {
        id,
        isBlueprint: () => isBlueprint({blueprint}),
        getAssociatedCourses: () => getAssociatedCourses(out)
    }
    return out;
}

test("Testing get associated courses logic", async () => {
    const mockData = [...range(0, 9)].map(i => {return {...dummyCourseData, id: i}})
    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    const courses = await getAssociatedCourses(getDummyBlueprintCourse(true, 0))
    const courseIds = courses.map(course => course.id).toSorted();
    expect(courseIds).toStrictEqual([...range(0, 9)]);

})

test("Testing blueprint retirement", async () => {
    const termName = 'DE8W03.11.24';
    let mockBpData = {...dummyCourseData, id: 0, blueprint: true, course_code: 'BP_TEST000'};
    fetchMock.mockResponseOnce(JSON.stringify(mockBpData));
    const mockBlueprint: IBlueprintCourse = await Course.getCourseById(0);
    let mockAssociatedCourseData: ICourseData[] = [{...dummyCourseData, id: 1, course_code: `${termName}_TEST000`}]
    fetchMock.mockResponseOnce(JSON.stringify(mockAssociatedCourseData));
    const sections = await mockBlueprint.getAssociatedCourses();
    let derivedTermName = await getTermNameFromSections(mockBlueprint);


})