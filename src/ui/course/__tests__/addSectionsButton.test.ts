import { fireEvent  } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Course } from '@ueu/ueu-canvas/course/Course';
import openThisContentInTarget from '@ueu/ueu-canvas/content/openThisContentInTarget';
import { act } from 'react';


import {addSectionsButton} from "@/ui/course/addButtons";

// Mock dependencies
jest.mock('@/canvas/content/openThisContentInTarget', () => jest.fn());

describe('addSectionsButton', () => {
    let header: HTMLElement;
    let bp: Course;
    let currentCourse: Course;

    beforeEach(() => {
        document.body.innerHTML = '';
        header = document.createElement('div');
        bp = {
            id: 1,
            courseCode: 'BP101',
            getAssociatedCourses: jest.fn().mockResolvedValue([{ id: 2, courseCode: 'Section101' }])
        } as any as Course;
        currentCourse = {
            id: 3,
            courseCode: 'CS101'
        } as any as Course;
        document.body.append(header);
    });

    it('appends section button to the header and opens sections on click', async () => {
        await act(async () => {
            await addSectionsButton(header, bp, currentCourse);
        });

        const sectionBtn = header.querySelector('.btn');
        expect(sectionBtn).toBeInTheDocument();
        expect(sectionBtn).toHaveTextContent('Sections');

        fireEvent.click(sectionBtn!);

        expect(openThisContentInTarget).toHaveBeenCalledWith(currentCourse, [{ id: 2, courseCode: 'Section101' }]);
    });

    it('does not append button if there are no sections', async () => {
        bp.getAssociatedCourses = jest.fn().mockResolvedValue(null);

        await act(async () => {
            await addSectionsButton(header, bp, currentCourse);
        });

        const sectionBtn = header.querySelector('.btn');
        expect(sectionBtn).not.toBeInTheDocument();
    });
});
