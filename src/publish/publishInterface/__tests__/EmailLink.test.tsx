import {
    EmailTextProps, getAdditionsTemplate,
    renderEmailTemplate, TemplateNotFoundError
} from "@/publish/publishInterface/EmailLink";
import {render} from "@testing-library/react";
import publishEmailMock, {
    mockCourseSpecificContent,
    mockFilled, mockFilledSpecific, mockTocXml,
    mockValues
} from "@/publish/publishInterface/__mocks__/publishEmailMock";
import {DOCUMENTATION_TOPICS_URL} from "@/consts";
import * as EmailLinkApi from '../EmailLink';
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
global.fetch = jest.fn();
const fetchMock = fetch as jest.Mock;

describe('Renders Email template', () => {
    it('render emails template', () => {
        expect(renderEmailTemplate(publishEmailMock, mockValues)).toEqual(mockFilled);
    })

    test('render email with course specific info', async() => {

        fetchMock.mockResolvedValueOnce( { ok: true, text: async () => mockTocXml });
        fetchMock.mockResolvedValueOnce({ ok: true, text: async () => mockCourseSpecificContent })
        const additionsTemplate = await getAdditionsTemplate('TEST000') as string;

        expect(renderEmailTemplate(
            publishEmailMock,
            mockValues,
            [additionsTemplate],
        )).toEqual(mockFilledSpecific);
    });

});



