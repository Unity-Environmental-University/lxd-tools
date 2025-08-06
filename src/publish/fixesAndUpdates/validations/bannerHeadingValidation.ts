import { ContentTextReplaceFix } from "./types";
import { IIdHaver } from "@/canvas/course/courseTypes";
import { testResult } from "./utils";
// import { Course } from "@/canvas/course/Course";
import { assignmentDataGen } from "@/canvas/content/assignments";
import PageKind from "@/canvas/content/pages/PageKind";
import AssignmentKind from "@/canvas/content/assignments/AssignmentKind";
import { BaseContentItem, IAssignmentData, UpdateAssignmentDataOptions } from "@/canvas";
import { IPageData } from "@/canvas/content/pages/types";
// import { getAssignmentData } from "@/canvas/content/assignments/legacy";


type UserData = {
    brokenAssignments?: IAssignmentData[],
    brokenPages?: IPageData[],
}

type _ValidationType = ContentTextReplaceFix<IIdHaver, BaseContentItem, UserData>


// Regex to find two sibling <p> tags inside a <div> and replace the second <p> with <h1>
// Example: <div><p>Title</p><p>Subtitle</p></div> => <div><p>Title</p><h1>Subtitle</h1></div>
const replaceSecondPWithH1Regex = new RegExp(
    /(<div[^>]*class=["']cbt-banner-header["'][^>]*>[\s\S]*?<div[^>]*>[\s\S]*?<p>[\s\S]*?<\/p>[\s\S]*?)(<p>([\s\S]*?)<\/p>)/gis
);


// Regex to find <span> tags inside <h1> tags within a div with class "cbt-banner-header" and remove them
// Example: <div><p>Title</p><p>Subtitle</p></div> => <div><p>Title</p><h1>Subtitle</h1></div>
const replaceSpanInH1Regex = new RegExp(
    /(<div[^>]*class=["'][^"']*cbt-banner-header[^"']*["'][^>]*>[\s\S]*?<h1>)([\s\S]*?<span>([\s\S]*?)<\/span>[\s\S]*?)(<\/h1>)/gis
);

const replaceStrongInH1Regex = new RegExp(
    /(<div[^>]*class=["'][^"']*cbt-banner-header[^"']*["'][^>]*>[\s\S]*?<h1>)([\s\S]*?<strong>([\s\S]*?)<\/strong>[\s\S]*?)(<\/h1>)/gis
);
// Regex to find <strong> tags inside <h1> tags within a div with class "cbt-banner-header" and remove them
// Example: <div><p>Title</p><p>Subtitle</p></div> => <div><p>Title</p><h1>Subtitle</h1></div>


const beforeAndAfters: _ValidationType['beforeAndAfters'] = [
[`<div id="cbt-banner-header" class="cbt-banner-header flexbox">
            <div>
                <p>Week 1 Overview</p>
                <h1><span>Indicators of Health and Disease and Diagnostic Procedures</span></h1>
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
                <h1><span>Indicators of Health and Disease and Diagnostic Procedures</span></h1>
            </div>`,
`            <div>
                <p>Week 1 Overview</p>
                <p>Indicators of Health and Disease and Diagnostic Procedures</p>
            </div>
</div>`
]

]

export const bannerHeadingValidation: _ValidationType = {
    name: "Banner heading validation",
    description: "Validates that the banner heading is semantic and does not use <span>, <p>, or <strong> tags",
    beforeAndAfters: beforeAndAfters,
    async run(course, config) {
        const assignments = await assignmentDataGen(course.id, config);
        const pages = PageKind.dataGenerator(course.id, config);

        let secondPWithH1Matches: RegExpMatchArray | null = null;
        let spanInH1Matches: RegExpMatchArray | null = null;
        let strongInH1Matches: RegExpMatchArray | null = null;

        for await (const assignment of assignments) {
            if (assignment.body) {
                secondPWithH1Matches = assignment.body.match(replaceSecondPWithH1Regex);
                spanInH1Matches = assignment.body.match(replaceSpanInH1Regex);
                strongInH1Matches = assignment.body.match(replaceStrongInH1Regex);
            }
        }

        for await (const page of pages) {
            if (page.body) {
                secondPWithH1Matches ||= page.body.match(replaceSecondPWithH1Regex);
                spanInH1Matches ||= page.body.match(replaceSpanInH1Regex);
                strongInH1Matches ||= page.body.match(replaceStrongInH1Regex);
            }
        }

        const userData: UserData = {
            brokenAssignments: [],
            brokenPages: []
        };

        const success = !secondPWithH1Matches && !spanInH1Matches && !strongInH1Matches;
        return testResult(success, {userData});
    },

    async fix(course, validationResult) {
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

        const {brokenAssignments = [], brokenPages = []} = userData;
        for (const assignment of brokenAssignments) {
            if (assignment.body) {
                assignment.body = assignment.body.replace(replaceSecondPWithH1Regex, '$1<h1>$3</h1>');
                assignment.body = assignment.body.replace(replaceSpanInH1Regex, '$1$2$3');
                assignment.body = assignment.body.replace(replaceStrongInH1Regex, '$1$2$3');

                const result = await AssignmentKind.put(course.id, assignment.id, {assignment});
                //Do error checking here
            }
        }
        for (const page of brokenPages) {
            if (page.body) {
                page.body = page.body.replace(replaceSecondPWithH1Regex, '$1<h1>$3</h1>');
                page.body = page.body.replace(replaceSpanInH1Regex, '$1$2$3');
                page.body = page.body.replace(replaceStrongInH1Regex, '$1$2$3');

                const result = await PageKind.put(course.id, page.id, {page});
                //Do error checking here
            }
        }

        return testResult(false, {
            notFailureMessage: "Fix not implemented yet.",
            userData: validationResult?.userData
        });
    },
};

//i think i can pass the broken header from beforeAndAfters through the fix function, or the exact string to find and replace it
// it will be a way of passing an output from the test that the fix can use
// i don't need to pass the regex itself because it should be declared at compile time here so both run and fix functions can access it

// const fixHeader:_ValidationType = {
//     name: "Check banner heading is semantic",
//     description: " Checks that the banner heading is semantic and does not use <span>, <p>, or <strong> tags",
//     beforeAndAfters,
//     async run(course, config) {
//         const assignmentGen = AssignmentKind.dataGenerator(course.id);
//         const pageGen = PageKind.dataGenerator(course.id);
//         for await(const assignment of assignmentGen) {
//             // Perform some checks or operations on the assignment
//             const body = assignment.body;
//         }
//         for await (const page of pageGen) {
//             // Perform some checks or operations on the page
//             const body = page.body;
//         }
//     },

//     async fix(course, validationResult) {
//         // This is a placeholder function. Replace with actual logic to fix the user data.
//         return testResult(false, {
//             notFailureMessage: "Fix not implemented yet.",
//             userData: validationResult?.userData
//         })
//     },
// }

export default  bannerHeadingValidation;

