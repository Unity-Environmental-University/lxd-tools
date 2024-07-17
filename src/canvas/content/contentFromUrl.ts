import {Assignment, AssignmentKindInfo} from "@/canvas/content/Assignment";
import {Quiz, QuizKindInfo} from "@/canvas/content/Quiz";
import {Page, PageKindInfo} from "@/canvas/content/Page";
import {Discussion, DiscussionKindInfo} from "@/canvas/content/Discussion";
import {ICanvasCallConfig} from "@/canvas/canvasUtils";


export const CONTENT_KINDS = [
    DiscussionKindInfo,
    AssignmentKindInfo,
    PageKindInfo,
    QuizKindInfo,
]

export function getContentClassFromUrl(url: string | null = null) {
    if (!url) url = document.documentURI;
    for (let class_ of [Assignment, Quiz, Page, Discussion]) {
        if (class_.contentUrlPart && url.includes(class_.contentUrlPart)) return class_;
    }
    return null;
}

export async function getContentItemFromUrl(url: string | null = null) {
    let ContentClass = getContentClassFromUrl(url);
    if (!ContentClass) return null;
    return await ContentClass.getFromUrl(url);
}

export function getContentKindFromUrl(url:string) {
    return CONTENT_KINDS.find(a => a.isValidUrl(url))
}

export async function getContentDataFromUrl(url:string, config:ICanvasCallConfig) {
    const kind = getContentKindFromUrl(url);
    if(!kind) return;
    const [courseId, id] = kind.getCourseAndContentIdFromUrl(url);
    if(!courseId || !id) return;
    return await kind.get(courseId, id, config);
}