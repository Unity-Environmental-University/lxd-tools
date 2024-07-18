import {IUserData} from "../../canvas/canvasDataDefs";
import {Temporal} from "temporal-polyfill";
import {renderToString} from "react-dom/server";
import React, {useState} from "react";
import {Course} from "../../canvas/course/Course";
import {useEffectAsync} from "@/ui/utils";
import {PUBLISH_FORM_EMAIL_TEMPLATE_URL} from "@/consts";
import {Alert} from "react-bootstrap";
import {ITermData} from "@/canvas/Term";

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
    const subject = encodeURIComponent(course.name?.replace('BP_', '') + ' Section(s) Ready Notification');
    const [emailTemplate, setEmailTemplate] = useState<string|undefined>();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffectAsync(async () => {
        if(emailTemplate) return;
        const emailResponse = await fetch(PUBLISH_FORM_EMAIL_TEMPLATE_URL);
        if(!emailResponse.ok) {
            setErrorMessages([emailResponse.statusText, await emailResponse.text()])
            return;
        }
        let template = await emailResponse.text();

        setEmailTemplate(template);
    }, [])



    async function copyToClipboard() {
        if(!emailTemplate) {
            setErrorMessages([`Can't find template email to fill at ` + PUBLISH_FORM_EMAIL_TEMPLATE_URL]);
            return;
        }
        const body = renderEmailTemplate(emailTemplate, {
        userName: user.name,
        userTitle: "Learning Experience Designer",
        courseCode: course.parsedCourseCode?.replace('BP_', '') ?? '[[CODE NOT FOUND]]',
        termName:termData ? termData.name : '[[TERM NAME]]',
        courseStart: getCourseStart(),
        publishDate: getPublishDate(),
    })
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([body], {type: 'text/html'})
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

    return <>
        <a href={`mailto:${user.email}?subject=${subject}&bcc=${bcc}`}>{emails.join(', ')}</a>
        {termData && <button onClick={copyToClipboard}>Copy Form Email to Clipboard</button>}
        { errorMessages.map(msg => <Alert>{msg}</Alert>) }
    </>
}


export type EmailTextProps = {
    userName: string,
    courseCode: string,
    userTitle: string,
    termName: string,
    courseStart: string,
    publishDate: string,
}

export function renderEmailTemplate(emailTemplate:string, props: EmailTextProps) {
    let renderedTemplate = emailTemplate.split('\n').slice(1).join('\n')
    return Object.entries(props).reduce((accumulator, [key, value]) => accumulator.replaceAll(`{{${key}}}`, value), renderedTemplate)
}