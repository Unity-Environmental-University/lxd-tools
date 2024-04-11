import {ContentFix, findReplaceFunc, notInTest} from "./index";

const removeTextBySme = {
    run: findReplaceFunc(/<p>\[Text[^\]]*by SME[^\]]*\]<\/p>/, ''),
    tests: [notInTest(/<p>\[Text[^\]]*by SME[^\]]*\]<\/p>/)]
}

const removeInsertAnnotationForMedia = {
    run: findReplaceFunc(/\[[iI]nsert annotation for media\]/, ''),
    tests: [notInTest(/\[.*annotation,.*\]/)]
}

const removeSecondaryMediaTitle = {
    run: findReplaceFunc(/<h3>\[Title for <span style="text-decoration: underline;"> optional <\/span>secondary media element\]<\/h3>/, ''),
    tests: [notInTest('secondary media element]')]
}

const annotationContentFixes: ContentFix[] = [
    removeTextBySme,
    removeInsertAnnotationForMedia,
    removeSecondaryMediaTitle
]

export default annotationContentFixes;

