import {IUserData} from "../../canvas/canvasDataDefs";
import {Temporal} from "temporal-polyfill";
import React, {useState} from "react";
import {Course} from "../../canvas/course/Course";
import {useEffectAsync} from "@/ui/utils";
import {DOCUMENTATION_TOC_URL, DOCUMENTATION_TOPICS_URL, PUBLISH_FORM_EMAIL_TEMPLATE_URL} from "@/consts";
import {Alert} from "react-bootstrap";
import {ITermData} from "@/canvas/Term";
import {baseCourseCode} from "@/canvas/course/code";

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
    const [emailTemplate, setEmailTemplate] = useState<string | undefined>();
    const [additionsTemplate, setAdditionsTemplate] = useState<string | undefined>();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffectAsync(async () => {
        if (emailTemplate) return;
        const emailResponse = await fetch(PUBLISH_FORM_EMAIL_TEMPLATE_URL);
        if (!emailResponse.ok) {
            setErrorMessages([emailResponse.statusText, await emailResponse.text()])
            return;
        }
        let template = await emailResponse.text();

        setEmailTemplate(template);
    }, [])


    useEffectAsync(async () => {
        if (course.baseCode) {
            const additionsTemplate = await getAdditionsTemplate(course.baseCode);
            setAdditionsTemplate(additionsTemplate);
        }
    }, [course])

    async function copyToClipboard() {
        if (!emailTemplate) {
            setErrorMessages([`Can't find template email to fill at ` + PUBLISH_FORM_EMAIL_TEMPLATE_URL]);
            return;
        }

        const additionsTemplates = [] as string[];
        if (course.baseCode) {
            const courseSpecificTemplate = await getAdditionsTemplate(course.baseCode);
            if (courseSpecificTemplate) additionsTemplates.push(courseSpecificTemplate)
        }
        const body = renderEmailTemplate(emailTemplate, {
            userName: user.name,
            userTitle: "Learning Experience Designer",
            courseCode: course.parsedCourseCode?.replace('BP_', '') ?? '[[CODE NOT FOUND]]',
            termName: termData ? termData.name : '[[TERM NAME]]',
            courseStart: getCourseStart(),
            publishDate: getPublishDate(),
        }, additionsTemplates)
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([body], {type: 'text/html'})
            })
        ])
        console.log(body);
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
        {errorMessages.map(msg => <Alert>{msg}</Alert>)}
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

export function renderEmailTemplate(emailTemplate: string, props: EmailTextProps, additions?: string[]) {
    let renderedTemplate = emailTemplate.split('\n').slice(1).join('\n')
    additions ??= [];
    const additionsString = additions.join('\n');
    renderedTemplate = renderedTemplate.replace('{additions}', additionsString)
    return Object.entries(props).reduce((accumulator, [key, value]) => accumulator.replaceAll(`{{${key}}}`, value), renderedTemplate)
}

let topicCache: string[] | undefined;

async function getSpecificTemplates() {

    if (topicCache) return topicCache;
    const tocResponse = await fetch(DOCUMENTATION_TOC_URL);
    if (!tocResponse.ok) {
        console.log(`Documentation not found at ${DOCUMENTATION_TOPICS_URL}`)
        return [] as string[];
    }
    const text = await tocResponse.text();
    const tocXml = new DOMParser().parseFromString(text, 'text/xml') as XMLDocument;

    const tocItems = [...tocXml.getElementsByTagName('toc-element')];
    const tocTopics = tocItems.map(a => a.getAttribute('topic'))
    console.log(tocTopics);
    const formEmailTemplate = tocItems.find(a => a.getAttribute('topic') == ('Form-Email-Template.md'))
    let children = formEmailTemplate?.getElementsByTagName('toc-element') ?? [];
    let topics: string[] = [];
    for (let node of children) {
        console.log(node.childNodes);
        const topic = node.getAttribute('topic');
        if (topic) topics.push(topic);
    }
    topicCache = topics;
    return topics;
}


export async function getAdditionsTemplate(courseCode: string) {
    const templates = await getSpecificTemplates();
    const baseCode = baseCourseCode(courseCode);
    if (!templates) return;
    if (!baseCode) return;
    const topic = templates && baseCode && templates.find(topic =>
        topic.toLocaleLowerCase().includes(baseCode.toLocaleLowerCase()));
    const url = `${DOCUMENTATION_TOPICS_URL}/${topic}`
    if (!topic || !url) return;
    const response = await fetch(url);
    if (!response.ok) throw new TemplateNotFoundError(courseCode);
    const additionsTemplate = await response.text();
    return additionsTemplate.split('\n').slice(1).join('\n')

}

export class TemplateNotFoundError extends Error {
    name = 'TemplateNotFoundError'
    code: string

    constructor(code: string, message?: string) {
        super(message ?? code);
        this.code = code;
    }
}