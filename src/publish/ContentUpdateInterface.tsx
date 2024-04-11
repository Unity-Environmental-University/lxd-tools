import React, {useState} from "react";
import {useEffectAsync} from "../ui/utils";
import {Button} from "react-bootstrap";
import Modal from "../ui/widgets/Modal/index";
import {Course} from "../canvas/index";
import {fixLmAnnotations} from "../canvas/fixes/annotations";
import assert from "assert";

type ContentUpdateInterfaceProps = {
    course: Course | null,
    parentCourse: Course | null
}

export function ContentUpdateInterface({course, parentCourse}: ContentUpdateInterfaceProps) {

    const [show, setShow] = useState(false)
    const [buttonText, setButtonText] = useState('Content Fixes');
    const [isDisabled, setIsDisabled] = useState(false);
    const [affectedUrls, setAffectedUrls] = useState<string[]>([])
    const [unaffectedUrls, setUnaffectedUrls] = useState<string[]>([])
    const [failedUrls, setFailedUrls] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false);

    useEffectAsync(async () => {
        if (course) {
            if (course.isDev) {
                setButtonText('No DEV Fixes Available')
            } else if (course.isBlueprint) {
                setButtonText('BP Content Fixes')
            } else {
                setButtonText("Can Only Fix from BP or DEV")
            }
        }
    }, [course]);


    async function removeLmAnnotations() {
        assert(course);
        setIsLoading(true);
        const results = await fixLmAnnotations(course);
        setAffectedUrls(results.fixedPages.map((page) => page.htmlContentUrl));
        setUnaffectedUrls(results.unchangedPages.map((page) => page.htmlContentUrl));
        setFailedUrls(results.failedPages.map((page) => page.htmlContentUrl));
        setIsLoading(false);
    }

    function urlRows(urls: string[], className = 'lxd-cu') {
        return urls.map((url, i) =>
            <div key={i} className={['row', className].join(' ')}>
                <div className={'col'}>
                    <a href={url} target={"_blank"}>{url}</a>
                </div>
            </div>)
    }

    function removeAnnotations() {
        return (course?.isBlueprint && <div className={'row'}>
            <div className={'col-sm-4'}>
                <Button onClick={removeLmAnnotations}>
                    Remove Annotation Placeholder
                </Button>
            </div>
            <div className={'col-sm-8'}>Removes annotation placeholders on Learning Material pages</div>
        </div>)
    }

    return (course && <>
        <Button disabled={isDisabled || course.isDev} className={"ui-button"} onClick={(e) => setShow(true)}
        >{buttonText}</Button>
        <Modal isOpen={show} requestClose={() => setShow(false)} canClose={!isLoading}>
            <h2>Content Fixes for {course.name}</h2>
            {course.isBlueprint && removeAnnotations()}
            {affectedUrls.length > 0 && <h3>Fixes Succeeded</h3>}
            {urlRows(affectedUrls, 'lxd-cu-success')}
            {unaffectedUrls.length > 0 && <h3>Fix not Needed</h3>}
            {urlRows(unaffectedUrls, 'lxd-cu-fail')}
            {failedUrls.length > 0 && <h3>Fix is Broken, Content Unchanged</h3>}
            {urlRows(failedUrls, 'lxd-cu-fail')}
        </Modal>
    </>)
}