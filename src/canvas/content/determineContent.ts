import {Quiz, QuizKind} from "@/canvas/content/Quiz";
import {Page, PageKind} from "@/canvas/content/Page";
import {Discussion, DiscussionKind} from "@/canvas/content/Discussion";
import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {Assignment} from "@/canvas/content/assignments/Assignment";
import {ContentData} from "@/canvas/content/types";
import {AssignmentKind} from "@/canvas/content/assignments/AssignmentKind";


export const CONTENT_KINDS = [
    DiscussionKind,
    AssignmentKind,
    PageKind,
    QuizKind,
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

export function getContentKindFromContent(contentData:ContentData) {
    return CONTENT_KINDS.find(a => a.dataIsThisKind(contentData));
}

export async function getContentDataFromUrl(url:string, config:ICanvasCallConfig) {
    const kind = getContentKindFromUrl(url);
    if(!kind) return;
    const [courseId, id] = kind.getCourseAndContentIdFromUrl(url);
    if(!courseId || !id) return;
    return await kind.get(courseId, id, config);
}