import {EmailTextProps} from "@/publish/publishInterface/EmailLink";

export default `# Publish Form Email
<p>My name is {{userName}} and I’m the {{userTitle}} who is preparing your course to run
this term.
Your course section(s) of {{courseCode}} has/have been created for you to teach
for {{termName}}. Your students will
have access to the syllabus and homepage on <strong>Monday, {{publishDate}}</strong>.
Actual course assignments will become available to the students
on <strong>Monday, {{courseStart}}</strong>,
the official start of the term.</p>
<ul>
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
</ul>
{additions}
<p>We appreciate your help in making sure these courses are good to go. Have a wonderful term.</p>
<p>Cheers,</p>
<p>{{userName}}</p>`


export const mockTocXml = `<?xml version="1.0" encoding="UTF-8"?>

<instance-profile id="lxd"
                 name="LXD Documentation"
                 start-page="LXD-Team-Goals.md">

    <toc-element topic="LXD-Team-Goals.md"/>
    <toc-element topic="Table-of-Contents.md">
        <toc-element topic="Course-Design.md">
            <toc-element topic="Equity-and-Inclusivity-Considerations-for-LXD-Designing-Courses.md"/>
            <toc-element topic="Course-Development-Timeline-and-Workflow.md"/>
            <toc-element topic="QA-Review.md"/>
            <toc-element topic="Video-Recording-Process.md"/>
        </toc-element>
        <toc-element topic="Elements-of-a-Course.md">
            <toc-element topic="Announcements.md"/>
            <toc-element topic="Assignments-and-Discussions.md"/>
            <toc-element topic="Course-Introduction.md"/>
            <toc-element topic="Course-Project-Philosophy.md"/>
            <toc-element topic="Course-Overview-Page.md"/>
            <toc-element topic="Learning-Materials.md"/>
            <toc-element topic="Quizzes.md"/>
            <toc-element topic="References-Page.md"/>
            <toc-element topic="Weekly-Overview-Pages.md"/>
        </toc-element>
        <toc-element topic="Role-Scope-and-Authority.md">
            <toc-element topic="Communication-Channels.md"/>
            <toc-element topic="Intellectual-Property.md"/>
        </toc-element>
        <toc-element topic="Rigor.md">
            <toc-element topic="Academic-Rigor-in-Unity-DE-Graduate-Courses.md"/>
            <toc-element topic="Rigor-in-Unity-DE-UG-Courses.md"/>
        </toc-element>
        <toc-element topic="Routine-LD-Meetings.md"/>
    </toc-element>
    <toc-element topic="Technical-Manual.md">
        <toc-element topic="Audits.md">
            <toc-element topic="Refresh-Rebuild-as-a-Result-of-Audit.md"/>
        </toc-element>
        <toc-element topic="Completing-a-Build.md">
            <toc-element topic="Accredible-Quick-Start-Guide.md"/>
            <toc-element topic="Assignments.md">
                <toc-element topic="Assignment-Ideas-SME-Version.md"/>
                <toc-element topic="Turnitin.md"/>
            </toc-element>
            <toc-element topic="Completing-a-New-Build-in-Canvas.md"/>
            <toc-element topic="Copying.md"/>
            <toc-element topic="New-Builds-Creating-and-Working-in-a-Google-Folder.md"/>
            <toc-element topic="Discussions.md"/>
            <toc-element topic="Grading-in-Canvas.md"/>
            <toc-element topic="Importing-a-Labster-Similation-into-Canvas-Assignments.md"/>
            <toc-element topic="Learning-Materials-Technical-Manual.md"/>
            <toc-element topic="Links.md"/>
            <toc-element topic="New-Pages-and-Editing-Pages.md"/>
            <toc-element topic="Quizzes-technical-manual.md"/>
            <toc-element topic="Rubrics.md"/>
        </toc-element>
        <toc-element topic="Lab-Courses.md">
            <toc-element topic="CHEM-102-and-104-Lab-Kits.md"/>
            <toc-element topic="CHEM-204-Lab-Kits.md"/>
        </toc-element>
        <toc-element topic="Media.md">
            <toc-element topic="Accessiblity-for-Color-and-Contrast.md"/>
            <toc-element topic="Course-Images.md"/>
            <toc-element topic="Envato-Photo-Resize-Program.md"/>
            <toc-element topic="How-to-Upload-Files-to-Canvas.md"/>
            <toc-element topic="OCR.md"/>
            <toc-element topic="Inserting-Media-in-Canvas.md"/>
            <toc-element topic="Studio.md"/>
            <toc-element topic="Video-Editing-Audio-Syncing.md"/>
        </toc-element>
        <toc-element topic="Refresh-and-Redesign-Process.md"/>
        <toc-element topic="Update-Process.md">
            <toc-element topic="Form-Email-Template.md">
                <toc-element topic="TEST000.md">
            </toc-element>
            <toc-element topic="LXD-Chrome-Extension.md">
                <toc-element topic="Finding-an-Instructor-s-Photo-and-BIo.md"/>
                <toc-element topic="Automated-Profile-Update-Process.md"/>
            </toc-element>
            <toc-element topic="Course-Edit-and-Feedback-from-an-Instructor.md"/>
            <toc-element topic="Editing-Course-Settings.md"/>
            <toc-element topic="Groups.md"/>
            <toc-element topic="Peer-Review.md"/>
            <toc-element topic="Publishing-Courses.md"/>
            <toc-element topic="Syncing-Changes-from-Blueprint-to-Live.md"/>
            <toc-element topic="Updating-Due-Dates.md"/>
            <toc-element topic="Updating-a-Syllabus.md"/>
        </toc-element>
    </toc-element>
    <toc-element topic="Course-Oddities.md">
        <toc-element topic="GIS-Courses.md"/>
        <toc-element topic="Materials-for-CHEM-204-Information-and-Purchasing-Directions-for-Students.md"/>
        <toc-element topic="Pre-Course-Modules.md"/>
        <toc-element topic="Wiki-Page-MBAQ-203.md"/>
    </toc-element>
    <toc-element topic="Resources-and-Definitions.md">
        <toc-element topic="Calendars.md"/>
        <toc-element topic="Commonly-Used-Tools-and-Technologies.md">
            <toc-element topic="Handshake.md"/>
            <toc-element topic="TinkerCad.md"/>
            <toc-element topic="Molecular-Drawing-Software.md"/>
            <toc-element topic="Microsoft-Word.md"/>
            <toc-element topic="Google-Drive.md"/>
            <toc-element topic="Draw-io-or-Diagrams-net.md"/>
            <toc-element topic="Submitting-Multiple-Files-with-Canvas-Studio.md"/>
            <toc-element topic="Canva.md"/>
            <toc-element topic="ArcGIS-StoryMaps.md"/>
            <toc-element topic="Adobe-Express.md"/>
        </toc-element>
        <toc-element topic="Course-Edit-and-Feedback-Form.md"/>
        <toc-element topic="Curio-Styling-and-Snippets.md"/>
        <toc-element topic="Definitions.md"/>
        <toc-element topic="Viewing-as-Student-or-Instructor.md"/>
        <toc-element topic="Fair-Use.md"/>
        <toc-element topic="How-to-Host-Instructor-Only-Files-in-Canvas.md"/>
    </toc-element>

</instance-profile>`

export const mockCourseSpecificContent = `# TEST000
<p>For this course, you will need to set groups manually in weeks 2 and 3. Please see the instructor guide for a detailed guide on how to do this.</p>
<ul>
<li>{{courseCode}}</li>
<li>A</li>
<li>B</li>
<li>C</li>
<li>D</li>
<li>{{userName}}</li>
</ul>`


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
<ul>
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
</ul>

<p>We appreciate your help in making sure these courses are good to go. Have a wonderful term.</p>
<p>Cheers,</p>
<p>steve</p>`

export const mockFilledSpecific = `<p>My name is steve and I’m the Learning Technology Support Specialist who is preparing your course to run
this term.
Your course section(s) of TEST1234 has/have been created for you to teach
for TERM1234. Your students will
have access to the syllabus and homepage on <strong>Monday, 1.1.2024</strong>.
Actual course assignments will become available to the students
on <strong>Monday, 1.1.2025</strong>,
the official start of the term.</p>
<ul>
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
</ul>
<p>For this course, you will need to set groups manually in weeks 2 and 3. Please see the instructor guide for a detailed guide on how to do this.</p>
<ul>
<li>TEST1234</li>
<li>A</li>
<li>B</li>
<li>C</li>
<li>D</li>
<li>steve</li>
</ul>
<p>We appreciate your help in making sure these courses are good to go. Have a wonderful term.</p>
<p>Cheers,</p>
<p>steve</p>`
