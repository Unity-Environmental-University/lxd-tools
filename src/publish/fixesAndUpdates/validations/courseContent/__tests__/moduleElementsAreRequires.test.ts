import {moduleGenerator} from "@canvas/course/modules";
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
    moduleGenerator: jest.fn(),
}));

describe("moduleElementsAreRequiredValidation", () => {
    it("should return success when all module items have completion requirements", async () => {
        // Arrange
        const mockCourse = {id: 123};
        const mockModuleItems: IModuleItemData[] = mockAll([
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
});
