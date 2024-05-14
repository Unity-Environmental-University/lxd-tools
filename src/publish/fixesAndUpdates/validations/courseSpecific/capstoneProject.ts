import {badContentFixFunc, badContentRunFunc, CourseValidationTest, preserveCapsReplace} from "../index";
import {IContentHaver} from "../../../../canvas/course/index";


export const projectRegex = /(research proposal|course project)/ig;
export const projectReplace = "Capstone Project Proposal";
export const courseProjectToCapstoneProjectProposal: CourseValidationTest<IContentHaver> = {
    courseCodes: ['PROF590', 'PROF690'],
    name: "Capstone project -> Capstone Project Proposal",
    description: `Replace 'Research Proposal' and 'Course Project' with 'Capstone Project Proposal'`,
    run: badContentRunFunc(projectRegex),
    fix: badContentFixFunc(projectRegex, projectReplace),
}

export const partnerToCollaborator: CourseValidationTest<IContentHaver> = {
    courseCodes: ['PROF590', 'PROF690'],
    name: "Capstone partner -> collaborator",
    description: "Replace partner with collaborator",
    run: badContentRunFunc(/\bpartner\b/ig),
    fix: badContentFixFunc(/\bpartner\b/ig, preserveCapsReplace('collaborator'))
}

export const partnershipToCollaboration: CourseValidationTest<IContentHaver> = {
    courseCodes: ['PROF590', 'PROF690'],
    name: "Capstone partnership -> collaboration",
    description: "Replace partnership with collaboration",
    run: badContentRunFunc(/\bpartnership\b/ig),
    fix: badContentFixFunc(/\bpartnership\b/ig, 'collaboration')
}


