import '@testing-library/jest-dom';
import { fireEvent, waitFor } from '@testing-library/dom';
import { Course } from '@/canvas/course/Course';
import { BaseContentItem } from '@/canvas/content';
import ReactDOM from 'react-dom/client';
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {Assignment} from "@/canvas/content/assignments";
import {mockAssignmentData} from "@/canvas/content/__mocks__/mockContentData";

import {
    addBpButton,
    addDevButton,
    addHighlightBigImageResizer,
    addOpenAllLinksButton,
    addSectionsButton
} from "@/ui/course/addButtons";

jest.mock('@/canvas/content');
jest.mock('@/ui/course/BpButton');
jest.mock('react-dom/client');
jest.mock('@/canvas/fetch/fetchJson')
jest.mock('@/canvas/fetch/getPagedDataGenerator')
describe('Button Functions', () => {
    let header: HTMLElement;
    let course: Course;
    let bp: Course;
    let currentContentItem: BaseContentItem;

    beforeEach(() => {
        header = document.createElement('div');
        document.body.appendChild(header);

        course = new Course(mockCourseData);
        bp = new Course({...mockCourseData, blueprint: true});
        currentContentItem = new Assignment(mockAssignmentData, course.id);

        course.getParentCourse = jest.fn().mockResolvedValue(bp);
        course.getAssociatedCourses = jest.fn().mockResolvedValue([bp]);
        course.isBlueprint = jest.fn().mockReturnValue(true);

        ReactDOM.createRoot = jest.fn().mockReturnValue({
            render: jest.fn(),
        });
    });

    afterEach(() => {
        document.body.removeChild(header);
    });

    test('addDevButton adds button and sets click handler', async () => {
        await addDevButton(header, course);

        const button = header.querySelector('btn');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('DEV');

        fireEvent.click(button!);

        await waitFor(() => expect(course.getParentCourse).toHaveBeenCalled());
    });


    test('addBpButton adds BpButton component', async () => {
        await addBpButton(header, course, bp);

        const rootDiv = header.querySelector('div');
        expect(rootDiv).toBeInTheDocument();
        expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootDiv);
    });

    test('addOpenAllLinksButton adds button and sets click handler', async () => {
        await addOpenAllLinksButton(header, currentContentItem);

        const button = header.querySelector('btn');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Links');

        fireEvent.click(button!);

        await waitFor(() => expect(currentContentItem.getAllLinks).toHaveBeenCalled());
    });

});
