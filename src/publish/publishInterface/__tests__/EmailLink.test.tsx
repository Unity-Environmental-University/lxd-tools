import {
    getAdditionsTemplate,
    renderEmailTemplate,
} from "@/publish/publishInterface/EmailLink";
import publishEmailMock, {
    mockCourseSpecificContent,
    mockFilled, mockFilledSpecific, mockTocXml,
    mockValues
} from "@/publish/publishInterface/__mocks__/publishEmailMock";
import {Course} from "@canvas/course/Course";
import {mockCourseData} from "@canvas/course/__mocks__/mockCourseData";
import PageKind from "@canvas/content/pages/PageKind";

window.fetch = jest.fn();
const fetchMock = fetch as jest.Mock;

describe('Renders Email template', () => {
    it('render emails template', () => {
        expect(renderEmailTemplate(publishEmailMock, mockValues)).toEqual(mockFilled);
    })

    test('render email with course specific info', async() => {

        jest.spyOn(Course.prototype, 'getParentCourse')
            .mockResolvedValue(undefined);
        fetchMock.mockResolvedValueOnce( { ok: true, text: async () => mockTocXml });
        fetchMock.mockResolvedValueOnce({ ok: true, text: async () => mockCourseSpecificContent })
        jest.spyOn(PageKind, "getByString")
            .mockResolvedValueOnce({ body: mockCourseSpecificContent } as any);
        jest.spyOn(PageKind, 'dataIsThisKind').mockReturnValue(true);

        const mockCourse: Course = new Course({
            ...mockCourseData
        })
        const additionsTemplate = await getAdditionsTemplate(mockCourse) as string;

        expect(renderEmailTemplate(
            publishEmailMock,
            mockValues,
            [additionsTemplate],
        )).toEqual(mockFilledSpecific);
    });

    test('...', () => {
        const xmlString = mockTocXml;
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlString, "application/xml");

const jsonResult = xmlToJson(xmlDoc);
console.log(JSON.stringify(jsonResult, null, 2));

    })


});




function xmlToJson(xml: Node): any {
    let obj: any = {};
    if (xml.nodeType === Node.ELEMENT_NODE) { // element
        const element = xml as Element;
        if (element.attributes.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < element.attributes.length; j++) {
                const attribute = element.attributes.item(j);
                if (attribute) {
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        }
    } else if (xml.nodeType === Node.TEXT_NODE) { // text
        obj = xml.nodeValue;
    }
    if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            const item = xml.childNodes.item(i);
            const nodeName = item.nodeName;
            if (typeof obj[nodeName] === "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof obj[nodeName].push === "undefined") {
                    const old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}



