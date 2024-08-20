import {
    badContentFixFunc,
    badContentRunFunc,
    preserveCapsReplace,
    TextReplaceValidation
} from "../validations";

import {IContentHaver} from "../../../../canvas/course/courseTypes";


export const projectRegex = /(research proposal|course project)/ig;
export const courseProjectToCapstoneProjectProposal: TextReplaceValidation<IContentHaver> = {
    courseCodes: ['PROF590', 'PROF690'],
    beforeAndAfters: [['your research proposals', 'your capstone project proposals'],  ['our course project', 'our capstone project proposal']],
    positiveExemplars: ['this Capstone Project Proposal'],
    name: "Capstone project -> Capstone Project Proposal",
    description: `Replace 'Research Proposal' and 'Course Project' with 'Capstone Project Proposal'`,
    run: badContentRunFunc(projectRegex),
    fix: badContentFixFunc(projectRegex, 'Capstone Project Proposal'),
}

const partnerRegex = /([^-])\bpartner(s|)\b/ig
export const partnerToCollaborator: TextReplaceValidation<IContentHaver> = {
    courseCodes: ['PROF590', 'PROF690'],
    beforeAndAfters: [['your partner', 'your collaborator'], ['your Partners', 'your Collaborators']],
    positiveExemplars: ['our collaborator'],
    name: "Capstone partner -> collaborator",
    description: "Replace partner with collaborator",
    run: badContentRunFunc(partnerRegex),
    fix: badContentFixFunc(partnerRegex, preserveCapsReplace(partnerRegex,'$1collaborator$2'))
}

const partnershipRegex = /\bpartnership(s|)\b/ig
export const partnershipToCollaboration: TextReplaceValidation<IContentHaver> = {
    courseCodes: ['PROF590', 'PROF690'],
    beforeAndAfters: [['Partnerships begin with', 'Collaborations begin with'], ['this partnership should', 'this collaboration should']],
    positiveExemplars: ['Our new collaboration'],
    name: "Capstone partnership -> collaboration",
    description: "Replace partnership with collaboration",
    run: badContentRunFunc(partnershipRegex),
    fix: badContentFixFunc(partnershipRegex,  preserveCapsReplace(partnershipRegex, 'collaboration$1'))
}

export default [courseProjectToCapstoneProjectProposal, partnerToCollaborator, partnershipToCollaboration]

