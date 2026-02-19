import {Quiz} from "@ueu/ueu-canvas/content/quizzes/Quiz";
import {Page} from "@ueu/ueu-canvas/content/pages/Page";
import {Discussion} from "@ueu/ueu-canvas/content/discussions/Discussion";
import {ICanvasCallConfig} from "@ueu/ueu-canvas/canvasUtils";
import {Assignment} from "@ueu/ueu-canvas/content/assignments/Assignment";
import {ContentData} from "@ueu/ueu-canvas/content/types";
import AssignmentKind from "@ueu/ueu-canvas/content/assignments/AssignmentKind";
import QuizKind from "@ueu/ueu-canvas/content/quizzes/QuizKind";
import PageKind from "@ueu/ueu-canvas/content/pages/PageKind";
import DiscussionKind from "@ueu/ueu-canvas/content/discussions/DiscussionKind";


export const CONTENT_KINDS = [
    DiscussionKind,
    AssignmentKind,
    PageKind,
    QuizKind,
]

export const ContentKinds = {
    fromUrl: getContentKindFromUrl,
    fromContent: getContentKindFromContent,
    getBody<Type extends ContentData>(contentData:Type) {
        const kind = getContentKindFromContent(contentData);
        return (kind?.getBody as (a:any) => string)(contentData);
    }
}


export function getContentClassFromUrl(url: string | null = null) {
    if (!url) url = document.documentURI;
    for (const class_ of [Assignment, Quiz, Page, Discussion]) {
        if (class_.contentUrlPart && url.includes(class_.contentUrlPart)) return class_;
    }
    return null;
}

export async function getContentItemFromUrl(url: string | null = null) {
    const ContentClass = getContentClassFromUrl(url);
    if (!ContentClass) return null;
    return await ContentClass.getFromUrl(url);
}

export function getContentKindFromUrl(url:string) {
    return CONTENT_KINDS.find(a => a.isValidUrl(url))
}


export type ContentKindInPractice = (typeof CONTENT_KINDS[number]);
export type ContentDataType<Kind extends ContentKindInPractice> = Awaited<ReturnType<Kind['get']>>
export function getContentKindFromContent<Kind extends ContentKindInPractice>(contentData:ContentDataType<Kind>) {


    const result = CONTENT_KINDS.find(a => a.dataIsThisKind(contentData)) as Kind;
    function typeGuard(result: ContentKindInPractice) : result is  Kind{
        return true;
    }
    if(!typeGuard(result)) throw new Error("Faulty content type coercion");
    return result;

}



export async function getContentDataFromUrl(url:string, config:ICanvasCallConfig) {
    const kind = getContentKindFromUrl(url);
    if(!kind) return;
    const [courseId, id] = kind.getCourseAndContentIdFromUrl(url);
    if(!courseId || !id) return;
    return await kind.get(courseId, id, config);
}