import {CONTENT_KINDS, getContentKindFromUrl} from "@/canvas/content/determineContent";
import assert from "assert";
import {BaseContentItem} from "@/canvas/content/BaseContentItem";



function getAllLinks(body:string): string[] {
    const el = bodyAsElement(body);
    const anchors = el.querySelectorAll('a');
    const urls: string[] = [];
    for (let link of anchors) urls.push(link.href);
    return urls;

}


function bodyAsElement(body: string) {
    let el = document.createElement('div');
    el.innerHTML = body;
    return el;
}
export function getFileLinks(body: string, courseId: number) {
    return getAllLinks(body).filter(a => a.match(/instructure\.com.*files\/\d+/i)).map(a => a.split('?')[0]);
}

export function getExternalLinks(body: string, courseId: number) {
    // Correct regex to exclude unity.instructure.com links properly
    return getAllLinks(body).filter(a => !a.match(/:\/\/unity\.instructure\.com\//i))

}