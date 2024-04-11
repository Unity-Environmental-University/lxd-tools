import {ContentFix, findReplaceFunc, FixFailureResult, notInTest, runReplacements} from "./index";
import {Course, Page} from "../index";

const removeMediaPlaceholder = {
    run: findReplaceFunc(/<p>\[Text[^\]]*by SME[^\]]*]<\/p>/, ''),
    tests: [notInTest(/<p>\[Text[^\]]*by SME[^\]]*]<\/p>/)]
}

const removeInsertAnnotationForMedia = {
    run: findReplaceFunc(/\[[iI]nsert annotation for media]/, ''),
    tests: [notInTest(/\[.*annotation,.*]/)]
}

const removeSecondaryMediaTitle = {
    run: findReplaceFunc(/<h3>\[Title for <span style="text-decoration: underline;"> optional <\/span>secondary media element\]<\/h3>/, ''),
    tests: [notInTest('secondary media element]')]
}

const removeBlockQuote = {
    run: function(input: string) {
        const el = document.createElement('div');
        el.innerHTML = input;
        const bqElement = el.querySelector('blockquote');
        if (bqElement?.innerHTML.includes('SME')) {
            bqElement.parentElement?.parentElement?.remove();
        }
        const output = el.innerHTML;
        el.remove();
        return output;
    },
    tests: [notInTest(/\[Pull quote -/)]
}


const removeLmNarrativePlaceholder = {
    run: function(input:string) {
        const el =  document.createElement('div');
        el.innerHTML = input;
        const divs = el.querySelectorAll<HTMLDivElement>('div.cbt-content');
        const toRemove = Array.from(divs).filter((div) => div.innerHTML.includes('LM Narrative'));
        for(let element of toRemove) element.remove();
        const output = el.innerHTML;
        el.remove();
        return output;
    },
    tests: [
        notInTest(/LM Narrative/)
    ]
}

const contentFixes: ContentFix[] = [
    removeMediaPlaceholder,
    removeLmNarrativePlaceholder,
    removeInsertAnnotationForMedia,
    removeSecondaryMediaTitle,
    removeBlockQuote,
]


/**
 * Removes annotation placeholder text from Learning Materials in the course
 * @param course
 */
async function fixLmAnnotations(course:Course) {
    let pages = await course.getPages({
        queryParams: {
            include: ['body'],
            search_term: 'learning materials'
        }
    });
    const pendingUpdates: Promise<any>[] = [];
    const fixedPages: Page[] = [];
    const unchangedPages: Page[] = [];
    const failedPages: Page[]  = [];
    const failedFixes: FixFailureResult<string>[] = [];

    for (let page of pages) {
        const sourceHtml = page.body;
        const fix = runReplacements(contentFixes, sourceHtml);
        const fixedValue = fix.output;

        if(fix.failedFixes.length > 0) {
            failedPages.push(page);
            console.log(page);
            console.log(fix);
        }
        if(sourceHtml === fixedValue) {
            console.log(sourceHtml.length - fixedValue.length)
            console.log(`Page unchanged ${page.name}`)
            unchangedPages.push(page);
        } else {
            console.log(`fixed ${page.name}`)
            pendingUpdates.push(page.updateContent(fixedValue));
            fixedPages.push(page);
        }
    }

    await Promise.all(pendingUpdates);
    return {fixedPages, unchangedPages, failedPages}
}


export { contentFixes, fixLmAnnotations };