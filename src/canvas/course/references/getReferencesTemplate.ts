import {DEV_TEMPLATE_COURSE_ID, REFERENCES_PAGE_URL_NAME} from "@/publish/consts";
import {IPageData} from "@/canvas/content/pages/types";
import {Page} from "@/canvas/content/assignments/pages/Page";
import {PageKind} from "@/canvas/content/assignments/pages/PageKind";


const url = `/api/v1/courses/${DEV_TEMPLATE_COURSE_ID}/pages/${REFERENCES_PAGE_URL_NAME}`;

export enum ReferenceExportType {
    string,
    pageData,
    page,
}

function getReferenceTemplate() : Promise<string|undefined>;
function getReferenceTemplate(type: ReferenceExportType.string) : Promise<string|undefined>;
function getReferenceTemplate(type: ReferenceExportType.pageData) : Promise<IPageData|undefined>;
async function getReferenceTemplate(type: ReferenceExportType.page) : Promise<Page|undefined>;
async function getReferenceTemplate<returnType>(type?: NonNullable<unknown>) {
    const pageData = await PageKind.getByString(DEV_TEMPLATE_COURSE_ID, REFERENCES_PAGE_URL_NAME)

    if(typeof type === 'undefined' || type === ReferenceExportType.string) return pageData.body;
    if(type === ReferenceExportType.pageData) return pageData;
    if(type === ReferenceExportType.page) return new Page(pageData,DEV_TEMPLATE_COURSE_ID);
}

export default getReferenceTemplate;