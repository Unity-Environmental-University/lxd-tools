import {Assignment} from "@/canvas/content/assignments";
import {Discussion, Page, Quiz} from "@/canvas/content/index";

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