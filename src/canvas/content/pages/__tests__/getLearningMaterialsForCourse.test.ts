import PageKind from "@canvas/content/pages/PageKind";
import {afterEach, beforeEach} from "@jest/globals";
import getLearningMaterialsWithModules from '../getLearningMaterialsWithModules';
import mockModuleData, {mockModuleItemData} from "@canvas/course/__mocks__/mockModuleData";
import mock = jest.mock;

jest.mock('@canvas/content/pages/PageKind', () => ({
    get: jest.fn(),
}));

const pageGet = PageKind.get as jest.Mock;

describe('getLearningMaterialsWithModules', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Gets learning materials from course pages', async () => {
        const courseId = 123;
        const mockModules = [
            {
                ...mockModuleData,
                id: 1,
                items: [{...mockModuleItemData, title: 'Week 1 Learning Materials', content_id: 101}]
                    .map( a => ({ ...mockModuleItemData, ...a})),
            }
        ];

        pageGet.mockResolvedValueOnce({id: 101, content: 'Learning materials content'});

        const result = await getLearningMaterialsWithModules(courseId, mockModules);

        expect(pageGet).toHaveBeenCalledWith(courseId, 101);
        expect(result).toEqual([
            {module: mockModules[0], lms: [{id: 101, content: 'Learning materials content'}]
        }]);
    });

    it('Successfully handles empty list of modules', async () => {
        const courseId = 123;
        const result = await getLearningMaterialsWithModules(courseId, []);
        expect(result).toEqual([]);
        expect(pageGet).not.toHaveBeenCalled();
    });

    it('Successfully handles modules without learning materials', async () => {
        const courseId = 123;
        const mockModules = [
            {...mockModuleData, id: 1, items: [{...mockModuleItemData, title: 'Week 1 Lecture', content_id: 101}]
                    .map( a => ({ ...mockModuleItemData, ...a}))}
        ];

        const result = await getLearningMaterialsWithModules(courseId, mockModules);

        expect(pageGet).not.toHaveBeenCalled();
        expect(result).toEqual([
            {module: mockModules[0], lms: []}
        ]);
    });

    it('Successfully handles modules with multiple learning materials', async () => {
        const courseId = 123;
        const mockModules = [
            {
                ...mockModuleData,
                id: 1,
                items: [
                    {title: 'Week 1 Learning Materials', content_id: 101},
                    {title: 'Week 1 Learning Materials', content_id: 102}
                ].map(a => ({...mockModuleItemData, ...a}))
            }
        ];

        pageGet.mockResolvedValueOnce({id: 101, content: 'Learning materials content 1'});
        pageGet.mockResolvedValueOnce({id: 102, content: 'Learning materials content 2'});

        const result = await getLearningMaterialsWithModules(courseId, mockModules);

        expect(pageGet).toHaveBeenCalledWith(courseId, 101);
        expect(pageGet).toHaveBeenCalledWith(courseId, 102);
        expect(result).toEqual([
            {
                module: mockModules[0],
                lms: [
                    {id: 101, content: 'Learning materials content 1'},
                    {id: 102, content: 'Learning materials content 2'}
                ]
            }
        ]);
    });
    it('Successfully handles mixed modules', async () => {
        const courseId = 123;
        const mockModules = [
            {
                ...mockModuleData,
                id: 1,
                items: [
                    {title: 'Week 1 Learning Materials', content_id: 101},
                    {title: 'Week 1 Learning Materials', content_id: 102}
                ].map(a => ({...mockModuleItemData, ...a}))
            },
            {
                ...mockModuleData, items: [
                    {...mockModuleItemData, title: 'Week 2 Overview', content_id: 103},
                ]
            },
            {
                ...mockModuleData,
                id: 3,
                items: [
                    {title: 'Week 3 Learning Materials', content_id: 104},
                    {title: 'Week 3 Learning Materials', content_id: 105}
                ].map(a => ({...mockModuleItemData, ...a}))
            }

        ];

        pageGet.mockResolvedValueOnce({id: 101, content: 'Learning materials content 1'});
        pageGet.mockResolvedValueOnce({id: 102, content: 'Learning materials content 2'});
        pageGet.mockResolvedValueOnce({id: 104, content: 'Learning materials content 3'});
        pageGet.mockResolvedValueOnce({id: 105, content: 'Learning materials content 4'});

        const result = await getLearningMaterialsWithModules(courseId, mockModules);

        expect(pageGet).toHaveBeenCalledWith(courseId, 101);
        expect(pageGet).toHaveBeenCalledWith(courseId, 102);
        expect(pageGet).toHaveBeenCalledWith(courseId, 104);
        expect(pageGet).toHaveBeenCalledWith(courseId, 105);
        expect(result).toEqual([
            {
                module: mockModules[0],
                lms: [
                    {id: 101, content: 'Learning materials content 1'},
                    {id: 102, content: 'Learning materials content 2'}
                ]
            },
            {
                module: mockModules[1],
                lms: [],
            },
            {
                module: mockModules[2],
                lms: [
                    {id: 104, content: 'Learning materials content 3'},
                    {id: 105, content: 'Learning materials content 4'}
                ]
            }

        ]);
    });


});
