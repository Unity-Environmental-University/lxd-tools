import { ContentTextReplaceFix } from "./types";
import { IIdHaver } from "@/canvas/course/courseTypes";
import { testResult } from "./utils";
import { assignmentDataGen } from "@/canvas/content/assignments";
import PageKind from "@/canvas/content/pages/PageKind";
import AssignmentKind from "@/canvas/content/assignments/AssignmentKind";
import { BaseContentItem, IAssignmentData } from "@/canvas";
import { IPageData } from "@/canvas/content/pages/types";


type UserData = {
    brokenAssignments: IAssignmentData[],
    brokenPages: IPageData[],
}

type _ValidationType = ContentTextReplaceFix<IIdHaver, BaseContentItem, UserData>

// Regex to find two sibling <p> tags inside a <div> and replace the second <p> with <h1>
// Example: <div><p>Title</p><p>Subtitle</p></div> => <div><p>Title</p><h1>Subtitle</h1></div>
const replaceSecondPWithH1Regex = new RegExp(
    /(<div[^>]+class=["'][^"']*\bcbt-banner-header\b[^"']*["'][^>]*>\s*<div>\s*<p>[^<]*<\/p>\s*)(<p>([^<]*)<\/p>)/i
);

// Regex to find <span> tags inside <h1> tags within a div with class "cbt-banner-header" and remove them
// Example: <div><p>Title</p><p>Subtitle</p></div> => <div><p>Title</p><h1>Subtitle</h1></div>
const replaceSpanInH1Regex = new RegExp(
    /(<div[^>]+class=["'][^"']*\bcbt-banner-header\b[^"']*["'][^>]*>[\s\S]*?<h1>)<span>([\s\S]*?)<\/span>(<\/h1>)/gi
);

// Regex to find <strong> tags inside <h1> tags within a div with class "cbt-banner-header" and remove them
// Example: <div><p>Title</p><p>Subtitle</p></div> => <div><p>Title</p><h1>Subtitle</h1></div>
const replaceStrongInH1Regex = new RegExp(
    /(<div[^>]+class=["'][^"']*\bcbt-banner-header\b[^"']*["'][^>]*>[\s\S]*?<h1>)<strong>([\s\S]*?)<\/strong>(<\/h1>)/gi
);

const beforeAndAfters: _ValidationType['beforeAndAfters'] = [
[`<div id="cbt-banner-header" class="cbt-banner-header flexbox">
            <div>
                <p>Week 1 Overview</p>
                <h1><span>Indicators of Health and Disease and Diagnostic Procedures</span></h1>
            </div>
    </div>`,
`<div id="cbt-banner-header" class="cbt-banner-header flexbox">
            <div>
                <p>Week 1 Overview</p>
                <h1>Indicators of Health and Disease and Diagnostic Procedures</h1>
            </div>
    </div>
</div>`
],
    [`<div id="cbt-banner-header" class="cbt-banner-header flexbox">
            <div>
                <p>Week 1 Overview</p>
                <p>Indicators of Health and Disease and Diagnostic Procedures</p>
            </div>
    <div>`,
`   <div id="cbt-banner-header" class="cbt-banner-header flexbox">
            <div>
                <p>Week 1 Overview</p>
                <h1>Indicators of Health and Disease and Diagnostic Procedures</h1>
            </div>
    </div>`
],
[`<div id="cbt-banner-header" class="cbt-banner-header flexbox">
            <div>
                <p>Week 1 Overview</p>
                <h1><strong>Indicators of Health and Disease and Diagnostic Procedures</strong></h1>
            </div>
    </div>`,
`<div id="cbt-banner-header" class="cbt-banner-header flexbox">
            <div>
                <p>Week 1 Overview</p>
                <h1>Indicators of Health and Disease and Diagnostic Procedures</h1>
            </div>
    </div>
</div>`
]
]

export const bannerHeadingValidation: _ValidationType = {
    name: "Banner heading validation",
    description: "Validates that the banner heading is semantic and does not use <span>, <p>, or <strong> tags",
    beforeAndAfters: beforeAndAfters,
    async run(course, config) {
        const assignments = assignmentDataGen(course.id, config);
        const pages = PageKind.dataGenerator(course.id, config);

        const userData: UserData = {
            brokenAssignments: [],
            brokenPages: []
        };

        for await (const assignment of assignments) {
            if (assignment.description) {
                if(
                    assignment.description.match(replaceSecondPWithH1Regex) ||
                    assignment.description.match(replaceSpanInH1Regex) ||
                    assignment.description.match(replaceStrongInH1Regex)
                ) {
                    userData.brokenAssignments.push(assignment);
                }
            }
        }

        for await (const page of pages) {
            if (page.body) {
                if(
                    page.body.match(replaceSecondPWithH1Regex) ||
                    page.body.match(replaceSpanInH1Regex) ||
                    page.body.match(replaceStrongInH1Regex)
                ) {
                    userData.brokenPages.push(page);
                }
            }
        }

        console.log("User data: ", userData);

        const success = userData.brokenAssignments.length === 0 && userData.brokenPages.length === 0;

        console.log("Success: ", success);

        return testResult(success, {userData});
    },

    async fix(course, validationResult) {
    validationResult = validationResult ?? await this.run(course, {});
    const {userData, success} = validationResult ?? {};
    
    if (success) { 
        return testResult("not run", {
            notFailureMessage: "Fix not needed, validation passed.",
        });
    }

    if (!userData) {
        return testResult("unknown", {
            notFailureMessage: "No user data to fix.",
        });
    }

    const brokenAssignments: IAssignmentData[] = userData.brokenAssignments;
    const brokenPages: IPageData[] = userData.brokenPages;
    const fixedAssignments = [];
    const fixedPages = [];
    
    for (const assignment of brokenAssignments) {
        if (assignment.description) {
            assignment.description = assignment.description
                .replace(replaceSecondPWithH1Regex, '$1<h1>$3</h1>')
                .replace(replaceSpanInH1Regex, '$1$2$3')
                .replace(replaceStrongInH1Regex, '$1$2$3');
            await AssignmentKind.put(course.id, assignment.id, {assignment});
            fixedAssignments.push(assignment);
        }
    }
    
    for (const page of brokenPages) {
        if (page.body) {
            page.body = page.body
                .replace(replaceSecondPWithH1Regex, '$1<h1>$3</h1>')
                .replace(replaceSpanInH1Regex, '$1$2$3')
                .replace(replaceStrongInH1Regex, '$1$2$3');
            console.log(course.id, page.page_id, page);
            await PageKind.put(course.id, page.page_id, {...page, wiki_page: {body: page.body}});
            fixedPages.push(page);
        }
    }

    // return final result after processing all items
    const anyFixed = fixedAssignments.length > 0 || fixedPages.length > 0;
    return testResult(anyFixed, {
        notFailureMessage: anyFixed 
            ? `Banner headings updated successfully (${fixedAssignments.length} assignments, ${fixedPages.length} pages).`
            : "No banner headings needed fixing.",
        userData: {
            ...userData,
            fixedAssignments,
            fixedPages
        }
    })
},
};

