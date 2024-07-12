import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {putContentConfig} from "@/canvas/content/index";

export function apiAndHtmlContentUrlFuncs(contentUrlPart: string) {
    return [
        courseContentUrlFunc(`/api/v1/courses/{courseId}/${contentUrlPart}/{contentId}`),
        courseContentUrlFunc(`/courses/{courseId}/${contentUrlPart}/{contentId}`),
    ]
}

function courseContentUrlFunc(url: string) {
    return (courseId: number, contentId: number) => url
        .replaceAll('{courseId}', courseId.toString())
        .replaceAll('{contentId}', contentId.toString())
}

export function putContentFunc<PutOptionsType extends Record<string, any>, ResponseDataType extends Record<string, any>>(contentUrlPart: string) {
    const [urlFunc] = apiAndHtmlContentUrlFuncs(contentUrlPart);
    return async function (courseId: number, contentId: number, content: PutOptionsType, config?: ICanvasCallConfig) {
        const url = urlFunc(courseId, contentId);
        return await fetchJson<ResponseDataType>(url, putContentConfig(content, config))
    }
}