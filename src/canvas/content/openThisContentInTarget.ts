import {Course} from "@/canvas/course/Course";
import {getContentItemFromUrl} from "@/canvas/content/getContent";
import {BaseContentItem} from "@/canvas/content/baseContentItem";

function getIdOrCourse(courseOrId: number | Course) {
    if (typeof courseOrId === 'object') return courseOrId.id;
    return courseOrId;
}

export default async function openThisContentInTarget(
    currentCourse: Course | number,
    target: Course | Course[] | number | number[]
) {
    if (!window) return;

    const currentCourseId = getIdOrCourse(currentCourse);
    const targetCourseIds = Array.isArray(target) ? target.map(getIdOrCourse) : [getIdOrCourse(target)];


    let currentContentItem: BaseContentItem | null = await getContentItemFromUrl(document.documentURI);
    let targetInfos = targetCourseIds.map((targetCourseId) => {
        return {
            courseId: targetCourseId,
            contentItemPromise: currentContentItem?.getMeInAnotherCourse(targetCourseId)
        }
    });

    for (let {courseId, contentItemPromise} of targetInfos) {
        let targetContentItem = await contentItemPromise;
        if (targetContentItem) {
            window.open(targetContentItem.htmlContentUrl);
        } else {
            let url = document.URL.replace(currentCourseId.toString(), courseId.toString())
            window.open(url);
        }
    }
}