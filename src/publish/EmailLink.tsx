import {ITermData, IUserData} from "../canvas/canvasDataDefs";
import {Course} from "../canvas/course/index";
import {Temporal} from "temporal-polyfill";
import {renderToString} from "react-dom/server";
import React from "react";

type EmailLinkProps = {
    user: IUserData,
    emails: string[],
    course: Course,
    sectionStart: Temporal.PlainDateTime | undefined,
    termData?: ITermData,
}

/**
 * Section start needed because the data based term start in Canvas is frustratingly wrong
 * @param user
 * @param emails
 * @param course
 * @param termData
 * @param termActualStart
 * @constructor
 */
export function EmailLink({user, emails, course, termData, sectionStart}: EmailLinkProps) {


    const bcc = emails.join(',');
    const subject = encodeURIComponent(course.name.replace('BP_', '') + ' Section(s) Ready Notification');

    async function copyToClipboard() {
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([renderToString(body)], {type: 'text/html'})
            })
        ])
    }

    function getCourseStart() {
        if (!sectionStart) return '[[Start Date]]'
        return sectionStart?.toLocaleString('en-US', {
            month: "short",
            day: 'numeric'
        });
    }

    function getPublishDate() {
        if (!sectionStart) return '[[publish date]]'
        const publishDate = sectionStart.add({'days': -7})
        console.log(publishDate.toLocaleString())
        return publishDate.toLocaleString('en-US', {
            month: "short",
            day: 'numeric'
        });
    }

    const body = (<>
        <p>My name is {user.name} and I’m the Learning Experience Designer who is preparing your course to run
            this
            term.
            Your course section(s) of {course.courseCode?.replace('BP_', '')} has/have been created for you to teach
            for {termData ? termData.name : '[[TERM NAME]]'}. Your students will
            have access to the syllabus and homepage on <strong>Monday, {getPublishDate()}</strong>.
            Actual course assignments will become available to the students
            on <strong>Monday, {getCourseStart()}</strong>,
            the official start of the term.</p>q
        <ul>
            <li>Please do not make any corrections or changes to your live course yourself, no matter how small. In
                order to maintain consistency between the live section and the course template,
                submit any issues via the Course Edit and Feedback Form so a Learning Technology Support Specialist can
                make sure the changes are made everywhere they need to be made.
            </li>
            <li>Let me know, when you have a chance to look, if you have any questions, or spot any issues with the
                course content.
            </li>

            <li>Be sure to check out the Instructor Orientation for useful information, such as your instructor
                bio/picture, grading. There is also a Labster Instructor Guide that you should review if your course
                contains a Labster simulation(s) in the course modules.
            </li>
            <li>Consult the Instructor Guide in your course for a brief overview of important information for teaching
                the course
            </li>
            <li>If you have technology or Canvas related questions, please contact <a
                href={'helpdesk@unity.edu'}>helpdesk@unity.edu</a>.
            </li>
            <li>For other questions or issues, please contact my supervisor, Chris Malmberg (<a
                href={'cmalmberg@unity.edu'}>cmalmberg@unity.edu</a>).
            </li>
        </ul>
        <p>You’ll notice that the courses appear different than they have in the past. This new format will look
            different
            but should not impact how you interact with your course and/or students. There are no changes to Canvas
            Inbox,
            announcements, the gradebook or SpeedGrader. For a more comprehensive overview of the new style, review this
            announcement.</p>
        <p>We appreciate your help in making sure these courses are good to go. Have a wonderful term.</p>
        <p>Cheers,</p>
        <p>{user.name}</p>
    </>);

    return <>
        <a href={`mailto:${user.email}?subject=${subject}&bcc=${bcc}`}>{emails.join(', ')}</a>
        {termData && <button onClick={copyToClipboard}>Copy Form Email to Clipboard</button>}
    </>
}