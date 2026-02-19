import {Course} from "@ueu/ueu-canvas/course/Course";
import {getContentItemFromUrl} from "@ueu/ueu-canvas/content/determineContent";
import {BaseContentItem} from "@ueu/ueu-canvas/content/BaseContentItem";

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

    
    const currentContentItem: BaseContentItem | null = await getContentItemFromUrl(document.documentURI);
    const targetInfos = targetCourseIds.map((targetCourseId) => {
        return {
            courseId: targetCourseId,
            contentItemPromise: currentContentItem?.getMeInAnotherCourse(targetCourseId)
        }
    });

    for (const {courseId, contentItemPromise} of targetInfos) {
        const targetContentItem = await contentItemPromise;
        if (targetContentItem) {
            window.open(targetContentItem.htmlContentUrl);
        } else {
            const url = document.URL.replace(currentCourseId.toString(), courseId.toString())
            window.open(url);
        }
    }
}

