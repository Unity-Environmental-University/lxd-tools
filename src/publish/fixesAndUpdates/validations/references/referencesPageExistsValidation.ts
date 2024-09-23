import {CourseFixValidation, testResult} from "@publish/fixesAndUpdates/validations/utils";
import {Course} from "@/canvas/course/Course";
import {IPageData} from "@/canvas/content/pages/types";
import PageKind from "@/canvas/content/pages/PageKind";
import {REFERENCES_PAGE_URL_NAME} from "@/publish/consts";
import getReferencesTemplate, {ReferenceExportType} from "@/canvas/course/references/getReferencesTemplate";
import assert from "assert";

export type RefPageValidationUserData = IPageData | { message: string};
const PAGE_NOT_FOUND = 'page not found';

const referencePageExistsValidation: CourseFixValidation<Course, RefPageValidationUserData> = {
    name: 'Learning Materials Reference Page Exists',
    description: 'Does this course have a learning materials references page?',
    async run(course, config) {
        let lmPageData = await PageKind.getByString(course.id, REFERENCES_PAGE_URL_NAME);

        return testResult(!('message' in lmPageData), {
            failureMessage: 'Learning Materials Page not found',
            userData: lmPageData,
        })

    },
    async fix(course, result?) {
        if(result && result.success) return testResult('not run', {userData: result.userData})
        const template = await getReferencesTemplate(ReferenceExportType.pageData);
        const postResult = await PageKind.post(course.id, {
            wiki_page: {
                title: template?.title,
                body: template?.body,
                published: true,
            }
        })
        assert(postResult);
        return await this.run(course)
    }
}

export default referencePageExistsValidation;