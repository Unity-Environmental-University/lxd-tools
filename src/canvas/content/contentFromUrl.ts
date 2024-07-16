import {Assignment} from "@/canvas/content/Assignment";
import {Quiz} from "@/canvas/content/Quiz";
import {Page} from "@/canvas/content/Page";
import {Discussion} from "@/canvas/content/Discussion";

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