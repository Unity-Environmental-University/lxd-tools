import { ContentTextReplaceFix } from "./types";
import { IIdHaver } from "@/canvas/course/courseTypes";
import { testResult } from "./utils";
import { Course } from "@/canvas/course/Course";
import { assignmentDataGen } from "@/canvas/content/assignments";
import PageKind from "@/canvas/content/pages/PageKind";
import AssignmentKind from "@/canvas/content/assignments/AssignmentKind";




type UserData = {}
//i want to assign the RESULTS of the regex to UserData
type _ValidationType = ContentTextReplaceFix<IIdHaver, UserData>


//Examples to test against
// can you write me a regex that finds <span> tags that are inside <h1> tags and removes them
// can you write me a regex that finds <strong> tags that are inside <h1> tags and removes them

// Regex to find two sibling <p> tags inside a <div> and replace the second <p> with <h1>
// Example: <div><p>Title</p><p>Subtitle</p></div> => <div><p>Title</p><h1>Subtitle</h1></div>
 const replaceSecondPWithH1Regex = new RegExp(/(<div[^>]*>\s*<p>.*?<\/p>\s*)(<p>(.*?)<\/p>)/gis,);
 const replaceSpanInH1Regex = new RegExp(/<h1>(.*?)<span>(.*?)<\/span>(.*?)<\/h1>/gis);
 const replaceStrongInH1Regex = new RegExp(/<h1>(.*?)<strong>(.*?)<\/strong>(.*?)<\/h1>/gis);



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

const fixHeader:_ValidationType = {
    name: "Check banner heading is semantic",
    description: " Checks that the banner heading is semantic and does not use <span>, <p>, or <strong> tags",
    beforeAndAfters,
    async run(course, config) {
        const assignmentGen = AssignmentKind.dataGenerator(course.id);
        const pageGen = PageKind.dataGenerator(course.id);
        for await(const assignment of assignmentGen) {
            // Perform some checks or operations on the assignment
            const body = assignment.body;
        }
        for await (const page of pageGen) {
            // Perform some checks or operations on the page
            const body = page.body;
        }
    },

    async fix(course, validationResult) {
        // This is a placeholder function. Replace with actual logic to fix the user data.
        return testResult(false, {
            notFailureMessage: "Fix not implemented yet.",
            userData: validationResult?.userData
        })
    },
}

export default fixHeader as _ValidationType;