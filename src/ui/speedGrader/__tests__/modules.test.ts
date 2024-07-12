// getModuleInfo.test.js

import { getModuleInfo, getItemInModule } from '../modules';
import {IModuleData} from "@/canvas/canvasDataDefs";
import mockModuleData, {mockModuleItemData} from "@/canvas/course/__mocks__/mockModuleData";
import {AssignmentsCollection} from "@/ui/speedGrader/AssignmentsCollection";

// Mock data
const mockContentItem = {
    id: 1,
    discussion_topic: { id: 101 },
    quiz_id: 201,
    rubric:{}
};

const mockModules:IModuleData[] = [
    {
        name: 'Week 1',
        items: [
            { title: 'Week 1 Discussion', content_id: 101 },
            { title: 'Week 1 Quiz', content_id: 201 }
        ].map(a => ({...mockModuleItemData, ...a}))
    },
    {
        name: 'Module 1',
        items: [
            { title: 'Module 1 Assignment', content_id: 1 }
        ].map(a => ({...mockModuleItemData, ...a}))
    }
].map(a => ({...mockModuleData, ...a}));

const mockAssignmentsCollection:AssignmentsCollection = Object.setPrototypeOf({
    getAssignmentContentType: jest.fn((contentItem) => {
        if (contentItem.discussion_topic) return 'Discussion';
        if (contentItem.quiz_id) return 'Quiz';
        return 'Assignment';
    }),
    getContentById: jest.fn((id) => ({ ...mockContentItem, rubric: {}, id })),
    getModuleItemType: jest.fn((moduleItem) => {
        if (moduleItem.content_id === 101) return 'Discussion';
        if (moduleItem.content_id === 201) return 'Quiz';
        return 'Assignment';
    })
}, AssignmentsCollection);

describe('getModuleInfo', () => {
    it('should return correct module info for a content item in a module', () => {
        const result = getModuleInfo(mockContentItem, mockModules, mockAssignmentsCollection);
        expect(result).toEqual({
            weekNumber: 1,
            moduleName: 'Week 1',
            type: 'Discussion',
            numberInModule: 1
        });
    });

    it('should return default values if no matching module item is found', () => {
        const nonMatchingContentItem = { id: 999 };
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
                {  ...mockModuleItemData, title: 'Week 2 Discussion', content_id: 101, rubric: {} }
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
});

describe('getItemInModule', () => {
    it('should return correct module item for a given content item', () => {
        const result = getItemInModule({...mockContentItem, rubric: []}, mockModules[0], mockAssignmentsCollection);
        expect(result).toEqual({
            ...mockModuleItemData,
            title: 'Week 1 Discussion',
            content_id: 101,
            type: 'Discussion',
            numberInModule: 1
        });
    });
    it('should not have a position in module if there is a discussion and no rubric', () => {
        const result = getItemInModule({...mockContentItem, rubric: undefined}, mockModules[0], mockAssignmentsCollection);
        expect(result).toEqual({
            ...mockModuleItemData,
            title: 'Week 1 Discussion',
            content_id: 101,
            type: 'Discussion',
            numberInModule: '-'
        });
    });


    it('should correctly handle different content types', () => {
        const quizContentItem = { quiz_id: 201, rubric: [] };
        const result = getItemInModule(quizContentItem, mockModules[0], mockAssignmentsCollection);
        expect(result).toEqual({
            title: 'Week 1 Quiz',
            content_id: 201,
            type: 'Quiz',
            numberInModule: 1
        });
    });

    it('should return undefined if no matching module item is found', () => {
        const nonMatchingContentItem = { id: 999 };
        const result = getItemInModule(nonMatchingContentItem, mockModules[0], mockAssignmentsCollection);
        expect(result).toBeUndefined();
    });
});
