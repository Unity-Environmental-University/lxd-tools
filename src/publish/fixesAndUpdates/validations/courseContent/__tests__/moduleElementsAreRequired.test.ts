import {moduleGenerator, saveModuleItem} from "@canvas/course/modules";
import {IModuleItemData} from "@canvas/canvasDataDefs";
import {
    moduleElementsAreRequiredValidation
} from "@publish/fixesAndUpdates/validations/courseContent/moduleElementsAreRequired";
import {mockModuleItemData} from "@canvas/course/__mocks__/mockModuleData";


export function mockAll<T>(partials: Partial<T>[], filler: T) {
    return partials.map(p => ({...filler, ...p})) as T[]
}

// Mock moduleGenerator
jest.mock("@canvas/course/modules", () => ({
    ...jest.requireActual("@canvas/course/modules"),
    moduleGenerator: jest.fn(),
    saveModuleItem: jest.fn(),
}));

describe("moduleElementsAreRequiredValidation", () => {
    const baseMockModuleItems : IModuleItemData[] = mockAll([
            {
                id: 1,
                title: "Module 1 Item",
                published: true,
                completion_requirement: {type: "must_submit"},
                html_url: "http://example.com/1"
            },
            {
                id: 2, title: "Module 2 Item", completion_requirement: {type: "must_submit"},
                published: true,
                html_url: "http://example.com/2"
            }
        ], mockModuleItemData);


    it("should return success when all module items have completion requirements", async () => {
        // Arrange
        const mockCourse = {id: 123};
        const mockModuleItems = [...baseMockModuleItems];

        (moduleGenerator as jest.Mock).mockImplementation(function* () {
            yield {published:true,  items: mockModuleItems};
        });

        // Act
        const result = await moduleElementsAreRequiredValidation.run(mockCourse);

        // Assert
        expect(result.success).toBe(true);
        expect(result.userData).toEqual([]);
    })
    ;

    it("should succeed when there are items without completion requirements in hidden modules", async () => {
        const mockCourse = {id: 123};
        const mockModuleItems: IModuleItemData[] = mockAll([
            {
                ...mockModuleItemData,
                id: 1,
                title: "Module 1 Item",
                completion_requirement: undefined,
                html_url: "http://example.com/1"
            },
            {
                ...mockModuleItemData,
                id: 2,
                title: "Module 2 Item",
                completion_requirement: { type: "must_submit"},
                html_url: "http://example.com/2"
            },
        ], mockModuleItemData);

        (moduleGenerator as jest.Mock).mockImplementation(function* () {
            yield {published:false, items: mockModuleItems};
        });

        // Act
        const result = await moduleElementsAreRequiredValidation.run(mockCourse);

        // Assert
        expect(result.success).toBe(true);
    })

    it("should return failure when some module items are missing completion requirements", async () => {
        // Arrange
        const mockCourse = {id: 123};
        const mockModuleItems: IModuleItemData[] = mockAll([
            {
                ...mockModuleItemData,
                id: 1,
                title: "Module 1 Item",
                completion_requirement: undefined,
                html_url: "http://example.com/1"
            },
            {
                ...mockModuleItemData,
                id: 2,
                title: "Module 2 Item",
                completion_requirement: { type: "must_submit"},
                html_url: "http://example.com/2"
            },
        ], mockModuleItemData);

        (moduleGenerator as jest.Mock).mockImplementation(function* () {
            yield {published:true, items: mockModuleItems};
        });

        // Act
        const result = await moduleElementsAreRequiredValidation.run(mockCourse);

        // Assert
        expect(result.success).toBe(false);
        expect(result.userData).toHaveLength(1);
        expect(result.userData?.[0].title).toBe("Module 1 Item");
        expect(result.messages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    bodyLines: ["Module 1 Item"],
                    links: ["http://example.com/1"],
                }),
            ])
        );
    });

    // skip("should fix requirements on assignments, discussions, anmd", async () => {
    //     // Arrange
    //     const mockCourse = {id: 123};
    //     const mockModuleItems= mockAll([
    //         {
    //             ...mockModuleItemData,
    //             id: 1,
    //             title: "Module 1 Item",
    //             type: "Discussion",
    //             completion_requirement: undefined,
    //             html_url: "http://example.com/1"
    //         },
    //         {
    //             ...mockModuleItemData,
    //             id: 2,
    //             title: "Module 1 Item 2",
    //             type: "Assignment",
    //             completion_requirement: undefined,
    //             html_url: "http://example.com/2"
    //         },
    //         {
    //             ...mockModuleItemData,
    //             id: 3,
    //             title: "Week 1 Learning Materials",
    //             type: "Page",
    //             completion_requirement: undefined,
    //             html_url: "http://example.com/2"
    //         },
    //         {
    //             ...mockModuleItemData,
    //             id: 4,
    //             title: "Week 1 Overview",
    //             type: "Page",
    //             completion_requirement: undefined,
    //             html_url: "http://example.com/2"
    //         },
    //         {
    //             ...mockModuleItemData,
    //             id: 5,
    //             title: "Course Project Overview",
    //             type: "Page",
    //             completion_requirement: undefined,
    //             html_url: "http://example.com/2"
    //         },
    //         {
    //             ...mockModuleItemData,
    //             id: 6,
    //             title: "ZZZ",
    //             type: "ExternalTool",
    //             completion_requirement: undefined,
    //             html_url: "http://example.com/2"
    //         },
    //         {
    //             ...mockModuleItemData,
    //             id: 7,
    //             title: "ZZZ",
    //             type: "Quiz",
    //             completion_requirement: undefined,
    //             html_url: "http://example.com/2"
    //         },
    //     ], {...mockModuleItemData, completion_requirement: undefined});
    //
    //
    //
    //     (saveModuleItem as jest.Mock).mockImplementation(async (a) => a)
    //
    //     // Act
    //     const result = await moduleElementsAreRequiredValidation.fix(mockCourse, {
    //         success: false,
    //         messages: [],
    //         userData: mockModuleItems satisfies { completion_requirement: undefined }[],
    //     });
    //
    //     // Assert
    //     expect(result.success).toBe(true);
    //     expect(result.userData).toHaveLength(5);
    //     expect(result.userData?.[0].title).toBe("Module 1 Item");
    //     expect(result.userData?.[1].title).toBe("Module 1 Item 2");
    //     expect(result.userData?.[2].title).toBe("Week 1 Learning Materials");
    //     expect(result.userData?.[3].title).toBe("Week 1 Overview");
    //     expect(result.userData?.[4].title).toBe("Course Project Overview");
    //
    //     expect(result.userData?.map((a: IModuleItemData )=> a.completion_requirement?.type)).toEqual(
    //         ["min_score", "must_submit", "must_submit", "must_view", "must_submit"]
    //     )
    // });
});


