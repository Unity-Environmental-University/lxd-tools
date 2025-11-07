import {IUserData} from "../../canvas/canvasDataDefs";
import {Temporal} from "temporal-polyfill";
import React, {useState} from "react";
import {Course} from "../../canvas/course/Course";
import {useEffectAsync} from "@/ui/utils";
import {Alert} from "react-bootstrap";
import {ITermData} from "@/canvas/term/Term";
import {PUBLISH_FORM_EMAIL_TEMPLATE_URL} from "@/publish/consts";
import pageKind from "@canvas/content/pages/PageKind";
import {fetchJson} from "@canvas/fetch/fetchJson";
import {IPageData} from "@canvas/content/pages/types";
import PageKind from "@canvas/content/pages/PageKind";

type EmailLinkProps = {
    user: IUserData,
    emails: string[],
    course: Course,
    sectionStart: Temporal.PlainDateTime | undefined,
    termData?: ITermData,
}


export async function getAdditionsTemplate(course: Course) {
    const devCourse = await course.getParentCourse();

    const additionPage = await getAdditionPage(course, devCourse);

    async function getAdditionPage(course: Course, devCourse: Course | undefined) {
        const bpAdditionPage = await PageKind.getByString(course.id, 'publish-form-email-addition');
        if(PageKind.dataIsThisKind(bpAdditionPage)) return bpAdditionPage;
        if(devCourse) {
            const devAdditionPage = await PageKind.getByString(devCourse.id, 'publish-form-email-addition');
            if(PageKind.dataIsThisKind(devAdditionPage)) return devAdditionPage;
        }
        return null;
    }

    console.log("Addendum page: ", additionPage);

    if(additionPage) {
        console.log("Returning: ", additionPage.body);
        return additionPage.body
    }
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
    const [isFetchingBaseEmail, setIsFetchingBaseEmail] = useState(false);
    const [isFetchingAdditions, setIsFetchingAdditions] = useState(false);
    const [textCopied, setTextCopied] = useState(false);

    useEffectAsync(async () => {

        if (emailTemplate) return;

        try {
            setIsFetchingBaseEmail(true);
            if(course.courseCode) {
                const parsedCourseCode = course.courseCode.match(/\d+/g);
                if (!parsedCourseCode) throw new Error(`Course code ${course.courseCode} does not contain a number`);
                const courseCodeNumber = parseInt(parsedCourseCode[0]);
                //const pageUrlId = encodeURIComponent('publish-form-email');

                let devCourseId: 7773747 | 7775658 | null = null;


                if (courseCodeNumber >= 500) {
                    devCourseId = 7773747;
                } else if (courseCodeNumber < 500) {
                    devCourseId = 7775658;
                }

                if (devCourseId) {
                    //Get the publish email from the page in the DEV course
                    const templateEmailPage = await PageKind.getByString(devCourseId, 'publish-form-email') as IPageData;
                    console.log(templateEmailPage);
                    setEmailTemplate(templateEmailPage.body);
                    console.log(templateEmailPage.body);
                    setIsFetchingBaseEmail(false);
                } else {
                    const emailResponse = await fetch(PUBLISH_FORM_EMAIL_TEMPLATE_URL);
                    if (!emailResponse.ok) {
                        setErrorMessages([emailResponse.statusText, await emailResponse.text()])
                        return;
                    }
                    setEmailTemplate(await emailResponse.text());
                    setIsFetchingBaseEmail(false);
                }
            }
        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            setErrorMessages([msg])
        }
    }, [])


    useEffectAsync(async () => {
        setIsFetchingAdditions(true);
        const _additionsTemplate = await getAdditionsTemplate(course);
        setAdditionsTemplate(_additionsTemplate);
        setIsFetchingAdditions(false);
    }, [course])

    async function copyToClipboard() {
        if (!emailTemplate && errorMessages.length > 0) {
            return;
        } else if (!emailTemplate) {
            setErrorMessages([`Can't find template email to fill at ` + PUBLISH_FORM_EMAIL_TEMPLATE_URL]);
            return;
        }

        console.log(emailTemplate);
        const additionsTemplates = [] as string[];
        if (additionsTemplate) {
            additionsTemplates.push(
                additionsTemplate
            )
        } else {
            if (course.baseCode) {
                const courseSpecificTemplate = await getAdditionsTemplate(course);
                if (courseSpecificTemplate) additionsTemplates.push(courseSpecificTemplate)
            }
        }
        const body = renderEmailTemplate(emailTemplate, {
            userName: user.name,
            userTitle: "Learning Experience Designer",
            courseCode: course.parsedCourseCode?.replace('BP_', '') ?? '[[CODE NOT FOUND]]',
            termName: termData ? termData.name : '[[TERM NAME]]',
            courseStart: getCourseStart(),
            publishDate: getPublishDate(),
        }, additionsTemplates)
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': new Blob([body], {type: 'text/html'})
                })
            ]);
            setTextCopied(true);
            setTimeout(() => setTextCopied(false), 1150);

        } catch (e) {
            console.error(e);
            setErrorMessages(prev => [
                ...prev,
                "Unable to copy to clipboard. Please try again."
            ]);
        }
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
        <a href={`mailto:${user.email}?subject=${subject}&bcc=${bcc}`}>{emails.join('; ')}</a>
        {termData &&
            <button disabled={isFetchingBaseEmail && isFetchingAdditions} onClick={copyToClipboard}>
                {isFetchingBaseEmail && isFetchingAdditions ? 'Loading...' : 'Copy Form Email to Clipboard'}
            </button>
        }
        {errorMessages.map(msg => <Alert>{msg}</Alert>)}
        {textCopied && <Alert variant={'success'}>Copied to clipboard!</Alert>}
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
    let renderedTemplate = emailTemplate;
    additions ??= [];
    const additionsString = additions.join('\n');
    renderedTemplate = renderedTemplate.replace('{additions}', additionsString)
    return Object.entries(props).reduce((accumulator, [key, value]) => accumulator.replaceAll(`{{${key}}}`, value), renderedTemplate)
}

export class TemplateNotFoundError extends Error {
    name = 'TemplateNotFoundError'
    code: string

    constructor(code: string, message?: string) {
        super(message ?? code);
        this.code = code;
    }
}