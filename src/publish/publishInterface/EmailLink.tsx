import {IUserData} from "@canvas/canvasDataDefs";
import {Temporal} from "temporal-polyfill";
import React, {useState, useMemo, useCallback} from "react";
import {Course} from "@canvas/course/Course";
import {useEffectAsync} from "@/ui/utils";
import {Alert} from "react-bootstrap";
import {ITermData} from "@/canvas/term/Term";
import {PUBLISH_FORM_EMAIL_TEMPLATE_URL} from "@/publish/consts";
import {IPageData} from "@canvas/content/pages/types";
import PageKind from "@canvas/content/pages/PageKind";

// Simple cache to store email templates by course ID
const emailTemplateCache = new Map<number, Promise<string>>();

// Function to fetch email template with caching
async function fetchEmailTemplate(course: Course): Promise<string> {
    if (emailTemplateCache.has(course.id)) {
        return emailTemplateCache.get(course.id)!;
    }

    const templatePromise = (async () => {
        if (!course.courseCode) {
            throw new Error('Course code is required');
        }

        const parsedCourseCode = course.courseCode.match(/\d+/g);
        if (!parsedCourseCode) {
            throw new Error(`Course code ${course.courseCode} does not contain a number`);
        }
        const courseCodeNumber = parseInt(parsedCourseCode[0]);

        let devCourseId: 7773747 | 7775658 | null = null;

        if (courseCodeNumber >= 500) {
            devCourseId = 7773747;
        } else if (courseCodeNumber < 500) {
            devCourseId = 7775658;
        }

        if (devCourseId) {
            // Get the publish email from the page in the DEV course
            const templateEmailPage = await PageKind.getByString(devCourseId, 'publish-form-email') as IPageData;
            return templateEmailPage.body;
        } else {
            const emailResponse = await fetch(PUBLISH_FORM_EMAIL_TEMPLATE_URL);
            if (!emailResponse.ok) {
                throw new Error(`${emailResponse.statusText}: ${await emailResponse.text()}`);
            }
            return await emailResponse.text();
        }
    })();

    emailTemplateCache.set(course.id, templatePromise);
    return templatePromise;
}

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
 * Section start needed because the data-based term start in Canvas is frustratingly wrong
 * @param user
 * @param emails
 * @param course
 * @param termData
 * @param termActualStart
 * @constructor
 */
export const EmailLink = React.memo(function EmailLink({user, emails, course, termData, sectionStart}: EmailLinkProps) {
    const bcc = useMemo(() => emails.join(','), [emails]);
    const subject = useMemo(() => encodeURIComponent(course.name?.replace('BP_', '') + ' Section(s) Ready Notification'), [course.name]);
    const [emailTemplate, setEmailTemplate] = useState<string | undefined>();
    const [additionsTemplate, setAdditionsTemplate] = useState<string | undefined>();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [textCopied, setTextCopied] = useState(false);

    useEffectAsync(async () => {
        // Only fetch if we don't have the template yet
        if (emailTemplate) return;

        try {
            const template = await fetchEmailTemplate(course);
            setEmailTemplate(template);
        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            setErrorMessages([msg])
        }
    }, [course.id, emailTemplate])


    useEffectAsync(async () => {
        if(additionsTemplate || !course.id) return;

        const _additionsTemplate = await getAdditionsTemplate(course);
        setAdditionsTemplate(_additionsTemplate);
    }, [course.id])

    const copyToClipboard = useCallback(async () => {
        if (!emailTemplate && errorMessages.length > 0) {
            return;
        } else if (!emailTemplate) {
            setErrorMessages([`Can't find template email to fill.`]);
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
    }, [emailTemplate, additionsTemplate, errorMessages.length, course, user.name, termData, sectionStart])

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
        {/*TODO; Get this to stop loading everytime information changes*/}
        {termData &&
            <button disabled={!emailTemplate} onClick={copyToClipboard}>
                {!emailTemplate ? 'Loading...' : 'Copy Form Email to Clipboard'}
            </button>
        }
        {errorMessages.map(msg => <Alert>{msg}</Alert>)}
        {textCopied && <Alert variant={'success'}>Copied to clipboard!</Alert>}
    </>
});


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
