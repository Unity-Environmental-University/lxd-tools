// getModuleInfo.test.js

import {getModuleInfo, getItemInModule} from '../modules';
import {CanvasData, IModuleData, IModuleItemData, ModuleItemType} from "@/canvas/canvasDataDefs";
import mockModuleData, {mockModuleItemData} from "@/canvas/course/__mocks__/mockModuleData";
import {AssignmentsCollection} from "@/ui/speedGrader/AssignmentsCollection";
import {mockAssignmentData, mockDiscussionData, mockQuizData} from "@/canvas/content/__mocks__/mockContentData";

import {Discussion} from "@/canvas/content/discussions/Discussion";
import {IAssignmentData} from "@/canvas/content/assignments/types";

// Mock data
const mockContentItem = {
    id: 1,
    discussion_topic: {id: 101},
    quiz_id: 201,
    rubric: {}
};

const mockContentItemWithoutRubric = {
    id: 1,
    discussion_topic: {id: 101},
    quiz_id: 201,
    rubric: {}
}

const mockModules: IModuleData[] = [
    {
        name: 'Week 1',
        items: [
            {title: "Introductions", content_id: 5, type: 'Discussion' as ModuleItemType},
            {title: 'Week 1 Discussion', content_id: 101, type: 'Discussion' as ModuleItemType},
            {title: 'Week 1 Discussion 2', content_id: 102, type: 'Discussion' as ModuleItemType},
            {title: 'Week 1 Quiz', content_id: 201, type: 'Quiz' as ModuleItemType}
        ].map(a => ({...mockModuleItemData, ...a}))
    },
    {
        name: 'Module 1',
        items: [
            {title: "Introductions", content_id: 10, type: 'Discussion' as ModuleItemType},
            {title: 'Module 1 Assignment', content_id: 1, type: 'Assignment'  as ModuleItemType}
        ].map(a => ({...mockModuleItemData, ...a}))
    }
].map(a => ({...mockModuleData, ...a}));


const mockIntroduction:IAssignmentData = {
    ...mockAssignmentData,
    discussion_topic: { ...mockDiscussionData, id: 5}
}
delete(mockIntroduction.rubric);

const mockAssignmentsCollection: AssignmentsCollection = new AssignmentsCollection([
    mockIntroduction,
    {...mockIntroduction, discussion_topic: {id: 10}, id:30},
    {...mockAssignmentData, discussion_topic: {id: 101}, id:20},
    {...mockAssignmentData, discussion_topic: {id: 102}, id:25},
    {...mockAssignmentData, quiz_id: 201, id: 10},
    {...mockAssignmentData, id: 300},
])

jest.spyOn(mockAssignmentsCollection, 'getAssignmentContentType')
jest.spyOn(mockAssignmentsCollection, 'getContentById')
jest.spyOn(mockAssignmentsCollection, 'getModuleItemType')


describe('getModuleInfo', () => {
        it('should return correct module info for a content item in a module', () => {
            const result = getModuleInfo({id: 1, discussion_topic: {id: 102}, rubric: []}, mockModules, mockAssignmentsCollection);
            expect(result).toEqual({
                weekNumber: 1,
                moduleName: 'Week 1',
                type: 'Discussion',
                numberInModule: 2
            });
        });

        it('should return default values if no matching module item is found', () => {
            const nonMatchingContentItem = {id: 999};
            const result = getModuleInfo(nonMatchingContentItem, mockModules, mockAssignmentsCollection);
            expect(result).toEqual({
                weekNumber: '-',
                moduleName: '-',
                type: 'Assignment',
                numberInModule: -1
            });
        });

        it('should correctly extract week number from module item titles', () => {
            const moduleWithWeekNumberInItemTitle = {
                ...mockModuleData,
                name: 'Module without week number',
                items: [
                    {...mockModuleItemData, title: 'Week 2 Discussion', content_id: 101, rubric: {}, type: 'Discussion' as ModuleItemType}
                ]
            };
            const result = getModuleInfo(mockContentItem, [moduleWithWeekNumberInItemTitle], mockAssignmentsCollection);
            expect(result).toEqual({
                weekNumber: 2,
                moduleName: 'Module without week number',
                type: 'Discussion',
                numberInModule: 1
            });
        });
    }
)
;


describe('getItemInModule', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })
    it('should return correct module item for a given content item', () => {
        const result = getItemInModule({ discussion_topic: { id: 101 }, rubric: []}, mockModules[0], mockAssignmentsCollection);
        expect(result).toEqual({
            ...mockModuleItemData,
            title: 'Week 1 Discussion',
            content_id: 101,
            type: 'Discussion',
            numberInModule: 1
        });
    });
    it('should not have a position in module if there is a discussion and no rubric', () => {
        const result = getItemInModule({
            ...mockContentItem,
            rubric: undefined
        }, mockModules[0], mockAssignmentsCollection);
        expect(result).toEqual({
            ...mockModuleItemData,
            title: 'Week 1 Discussion',
            content_id: 101,
            type: 'Discussion',
            numberInModule: '-'
        });
    });


    it('should return undefined if no matching module item is found', () => {
        const nonMatchingContentItem = {...mockContentItem, id: 999};
        (mockAssignmentsCollection.getContentById as jest.Mock).mockReturnValueOnce(undefined);
        (mockAssignmentsCollection.getAssignmentContentType as jest.Mock).mockReturnValueOnce('Assignment');
        const result = getItemInModule(nonMatchingContentItem, mockModules[0], mockAssignmentsCollection);
        expect(result).toBeUndefined();
    });
});


describe('getContentItemId', () => {
    it('should return discussion id for a discussion', () => {
        expect(getContentItemId({id: 10, discussion_topic: {id: 99}}, 'Discussion')).toEqual(99);
    })
    it('should return quiz id for a quiz', () => {
        expect(getContentItemId({id: 10, quiz_id: 99}, "Quiz")).toEqual(99);
    })
    it('should return id for anything else', () => {
        for (let type of <ModuleItemType[]>["ExternalTool", "ExternalUrl", "Page", "File", "Subheader"]) {
            expect(getContentItemId({id: 12}, type)).toEqual(12);

        }
    })
})

export function getContentItemId(contentItem: CanvasData, type: ModuleItemType) {
    if (type === 'Discussion') return contentItem.discussion_topic.id;
    if (type === 'Quiz') return contentItem.quiz_id;
    return contentItem.id;
}