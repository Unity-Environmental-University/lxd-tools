import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/dom';


import ReactDOM from 'react-dom/client';
import {mockCourseData} from "@ueu/ueu-canvas";
import {act} from "react";

import {main} from "../main";
import {
    addBpButton,
    addDevButton,
    addHighlightBigImageResizer,
    addHomeTileButton,
    addOpenAllLinksButton,
    addSectionsButton
} from "../addButtons"
import assert from "assert";
import {Course} from "@ueu/ueu-canvas";


import * as courseApi from '@ueu/ueu-canvas';
import {getSingleCourse} from "@ueu/ueu-canvas";

import * as determineContent from "@ueu/ueu-canvas";
import {getContentClassFromUrl} from "@ueu/ueu-canvas";
jest.mock('@/canvas/fetch/getPagedDataGenerator')
jest.mock('@/canvas/fetch/fetchJson')
jest.mock('../addButtons')

jest.mock('@/ui/course/BpButton');
jest.mock('react-dom/client');

const getSingleCourseSpy = jest.spyOn(courseApi, 'getSingleCourse');
const getContentClassFromUrlSpy = jest.spyOn(determineContent, 'getContentClassFromUrl')
describe('Base level async call', () => {
    let header: HTMLElement;
    let homeTileHost: HTMLElement;

    beforeEach(() => {
        header = document.createElement('div');
        header.classList.add('right-of-crumbs');
        document.body.appendChild(header);

        homeTileHost = document.createElement('div');
        homeTileHost.id = 'Modules-anchor';
        document.body.appendChild(homeTileHost);
        Course.getFromUrl = jest.fn().mockResolvedValue(new Course(mockCourseData));
        ReactDOM.createRoot = jest.fn().mockReturnValue({
            render: jest.fn(),
        });
    });


    afterEach(() => {
        document.body.removeChild(header);
        document.body.removeChild(homeTileHost);
    });

    test('Base level async call workflow', async () => {
        Object.defineProperty(document, 'documentURI', { value:'https://example.com/courses/123/assignments/321'});
        Object.defineProperty(document, 'URL', { value: 'https://example.com/courses/123/assignments/321'})
        getSingleCourseSpy.mockResolvedValue(new Course({...mockCourseData, blueprint: true}));
        const course = await Course.getFromUrl(document.documentURI) as Course;
        const frontPageSpy = jest.spyOn(course, 'getFrontPage')

        await act(async () => await main());
        await waitFor(() => {
            expect(Course.getFromUrl).toHaveBeenCalled();
        });


        await waitFor(() => {
            expect(getContentClassFromUrl).toHaveBeenCalled();
        });

        const CurrentContentClass = getContentClassFromUrl(document.documentURI);
        const currentContentItem = await CurrentContentClass?.getFromUrl();

        if (!CurrentContentClass && /courses\/\d+/.test(document.documentURI)) {

            await waitFor(() => {
                expect(frontPageSpy).toHaveBeenCalled();
            });
        }

        await waitFor(() => {
            expect(document.querySelector('.right-of-crumbs')).toBeInTheDocument();
        });

        if (course!.isBlueprint()) {
            await waitFor(() => {
                expect(addDevButton).toHaveBeenCalledWith(header, course);
                expect(addSectionsButton).toHaveBeenCalledWith(header, course);
            });
        } else {
            assert(course);
            const bp = await getSingleCourse(`BP_${course.baseCode}`, course.getAccountIds());
            await waitFor(() => {
                expect(addBpButton).toHaveBeenCalledWith(header, course, bp);
            });
            if (bp) {
                await waitFor(() => {
                    expect(addSectionsButton).toHaveBeenCalledWith(header, bp, course);
                });
            }
        }

        if (currentContentItem) {
            await waitFor(() => {
                expect(addOpenAllLinksButton).toHaveBeenCalledWith(header, currentContentItem);
                expect(addHighlightBigImageResizer).toHaveBeenCalledWith(currentContentItem);
            });
        }

        await waitFor(() => {
            expect(document.querySelector('#Modules-anchor')).toBeInTheDocument();
        });

        if (homeTileHost) {
            const buttonHolder = document.querySelector('#Modules-anchor > div');
            expect(buttonHolder).toBeInTheDocument();
            expect(addHomeTileButton).toHaveBeenCalledWith(buttonHolder, course);
        }
    });
});
