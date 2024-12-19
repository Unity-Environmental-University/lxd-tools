import {genBlueprintDataForCode} from "@canvas/course/blueprint";
import {Course} from "@canvas/course/Course";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";
import {mockAsyncGen} from "@/__mocks__/utils";
import {mockCourseData} from "@canvas/course/__mocks__/mockCourseData";
import {mockAssignmentData, mockDiscussionData} from "@canvas/content/__mocks__/mockContentData";
import {genEquivalentDiscussionData} from "@canvas/content/discussions/genEquivalentDiscussionData";
import DiscussionKind from "@canvas/content/discussions/DiscussionKind";
import {renderAsyncGen} from "@canvas/canvasUtils";
import {IAssignmentData, IDiscussionData} from "@canvas/content/types";

// Local mock data for discussions
const localMockDiscussionData = {...mockDiscussionData} as IDiscussionData;

jest.mock("@canvas/course/blueprint", () => ({
    ...jest.requireActual("@canvas/course/blueprint"),
    genBlueprintDataForCode: jest.fn(),
}));

describe.skip("Testing genEquivalentDiscussionData", () => {
    let mockAssignments: IAssignmentData[];
    // Reset mocks before each test
    beforeEach(() => {
        jest.resetAllMocks();
    });


    beforeEach(() => {
        mockAssignments = [
            {...mockAssignmentData, id: 1, course_id: 100, discussion_topic: localMockDiscussionData},
            {...mockAssignmentData, id: 2},
        ];
    });

    it("should generate equivalent discussion data correctly for mock course", async () => {
        // Mock the behavior of AssignmentKind.dataGenerator and DiscussionKind.dataGenerator
        jest.spyOn(AssignmentKind, "dataGenerator").mockReturnValue(mockAsyncGen(mockAssignments));
        jest.spyOn(DiscussionKind, "dataGenerator").mockReturnValue(mockAsyncGen([localMockDiscussionData]));

        const mockCourse = new Course({...mockCourseData, courseCode: "COURSE123", accountId: "ACC123"});

        // Mock the genBlueprintDataForCode function
        const mockGenBlueprintData = {...mockCourseData, id: "100"};
        (genBlueprintDataForCode as jest.Mock).mockReturnValue(mockAsyncGen([mockGenBlueprintData]));

        const result = await renderAsyncGen(genEquivalentDiscussionData(mockCourse, 1));

        // Assert the result
        expect(result).toEqual([localMockDiscussionData]);
        expect(genBlueprintDataForCode).toHaveBeenCalledWith(mockCourse.name, [mockCourse.accountId]);
    });

    // Victory lap test
    it("should yield correct discussion data for multiple blueprints", async () => {
        // Mock the behavior of AssignmentKind.dataGenerator and DiscussionKind.dataGenerator
        jest.spyOn(AssignmentKind, "dataGenerator").mockReturnValue(mockAsyncGen(mockAssignments));
        jest.spyOn(DiscussionKind, "dataGenerator").mockReturnValue(mockAsyncGen([localMockDiscussionData]));

        const mockCourse = new Course({...mockCourseData, courseCode: "COURSE123", accountId: "ACC123"});

        // Mock the genBlueprintDataForCode function to return multiple blueprints
        const mockBlueprints = [
            {id: "blueprint1", courseCode: "COURSE123", accountId: "ACC123"},
            {id: "blueprint2", courseCode: "COURSE123", accountId: "ACC123"},
        ];
        (genBlueprintDataForCode as jest.Mock).mockReturnValue(mockAsyncGen(mockBlueprints));

        const result = await renderAsyncGen(genEquivalentDiscussionData(mockCourse, 1));

        // Assert the result
        expect(result).toEqual([localMockDiscussionData]); // Since only the first assignment has a discussion topic
        expect(genBlueprintDataForCode).toHaveBeenCalledWith(mockCourse.courseCode, [mockCourse.accountId]);
    });

    it("should handle case where no discussion is found for the assignment", async () => {
        // Mock the behavior of AssignmentKind.dataGenerator and DiscussionKind.dataGenerator
        jest.spyOn(AssignmentKind, "dataGenerator").mockReturnValueOnce(
            mockAsyncGen(mockAssignments.map(a => ({...a, discussion_topic: undefined}))));
        jest.spyOn(DiscussionKind, "dataGenerator").mockReturnValueOnce(mockAsyncGen([]));  // No discussions

        const mockCourse = new Course({...mockCourseData, courseCode: "COURSE123", accountId: "ACC123"});

        // Mock the genBlueprintDataForCode function
        const mockGenBlueprintData = {...mockCourseData, id: "100"};
        (genBlueprintDataForCode as jest.Mock).mockReturnValueOnce(mockAsyncGen([mockGenBlueprintData]));

        const result = await renderAsyncGen(genEquivalentDiscussionData(mockCourse, 1));

        // Assert that no results are returned if no discussion is found
        expect(result).toEqual([]);  // Expect an empty array since no discussion was found for the assignment
        expect(genBlueprintDataForCode).toHaveBeenCalledWith(mockCourse.name, [mockCourse.accountId]);
    });

});
