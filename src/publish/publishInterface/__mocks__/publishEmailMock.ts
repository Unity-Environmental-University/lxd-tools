import {EmailTextProps} from "@/publish/publishInterface/EmailLink";

export default
`# Publish Form Email
<p>My name is {{userName}} and I’m the {{userTitle}} who is preparing your course to run
            this term.
            Your course section(s) of {{courseCode}} has/have been created for you to teach
            for {{termName}}. Your students will
            have access to the syllabus and homepage on <strong>Monday, {{publishDate}}</strong>.
            Actual course assignments will become available to the students
            on <strong>Monday, {{courseStart}}</strong>,
            the official start of the term.</p>
        <list>
            <li>Please do not make any corrections or changes to your live course yourself, no matter how small. In
                order to maintain consistency between the live section and the course template,
                submit any issues via the <a href='https://docs.google.com/forms/d/e/1FAIpQLSeybl9b-xk-pL1bsWX7x9esQYoHHyi3rPPOq75mK4Q4n4b5tQ/viewform'>Course Edit and Feedback Form</a> so a Learning Technology Support Specialist can
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
                href='mailto:helpdesk@unity.edu'>helpdesk@unity.edu</a>.
            </li>
            <li>For other questions or issues, please contact my supervisor, Chris Malmberg (<a
                href='mailto:cmalmberg@unity.edu'>cmalmberg@unity.edu</a>).
            </li>
        </list>
        <p>We appreciate your help in making sure these courses are good to go. Have a wonderful term.</p>
        <p>Cheers,</p>
        <p>{{userName}}</p>`


export const mockValues: EmailTextProps = {
    courseCode: "TEST1234", courseStart: "1.1.2025", publishDate: "1.1.2024", termName: "TERM1234",
    userName: 'steve',
    userTitle: 'Learning Technology Support Specialist'

}

export const mockFilled = `<p>My name is steve and I’m the Learning Technology Support Specialist who is preparing your course to run
            this term.
            Your course section(s) of TEST1234 has/have been created for you to teach
            for TERM1234. Your students will
            have access to the syllabus and homepage on <strong>Monday, 1.1.2024</strong>.
            Actual course assignments will become available to the students
            on <strong>Monday, 1.1.2025</strong>,
            the official start of the term.</p>
        <list>
            <li>Please do not make any corrections or changes to your live course yourself, no matter how small. In
                order to maintain consistency between the live section and the course template,
                submit any issues via the <a href='https://docs.google.com/forms/d/e/1FAIpQLSeybl9b-xk-pL1bsWX7x9esQYoHHyi3rPPOq75mK4Q4n4b5tQ/viewform'>Course Edit and Feedback Form</a> so a Learning Technology Support Specialist can
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
                href='mailto:helpdesk@unity.edu'>helpdesk@unity.edu</a>.
            </li>
            <li>For other questions or issues, please contact my supervisor, Chris Malmberg (<a
                href='mailto:cmalmberg@unity.edu'>cmalmberg@unity.edu</a>).
            </li>
        </list>
        <p>We appreciate your help in making sure these courses are good to go. Have a wonderful term.</p>
        <p>Cheers,</p>
        <p>steve</p>`
