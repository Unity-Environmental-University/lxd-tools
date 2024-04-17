import React, {useState} from "react";
import {useEffectAsync} from "../ui/utils";
import {Button} from "react-bootstrap";
import Modal from "../ui/widgets/Modal/index";
import {Course, Page} from "../canvas/index";
import {fixLmAnnotations} from "../canvas/fixes/annotations";
import assert from "assert";
import {UpdateStartDate} from "./fixesAndUpdates/UpdateStartDate";

type ContentUpdateInterfaceProps = {
    course: Course | null,
    parentCourse: Course | null,
    refreshCourse: ()=>Promise<void>
}

export class MismatchedUnloadError extends Error {
    public name = "Mismatched Unload Error"
}

export function ContentUpdateInterface({course, parentCourse, refreshCourse}: ContentUpdateInterfaceProps) {

    const [show, setShow] = useState(false)
    const [buttonText, setButtonText] = useState('Content Fixes');
    const [isDisabled, setIsDisabled] = useState(false);
    const [affectedItems, setAffectedItems] = useState<React.ReactElement[]>([])
    const [unaffectedItems, setUnaffectedItems] = useState<React.ReactElement[]>([])
    const [failedItems, setFailedItems] = useState<React.ReactElement[]>([])
    const [loadingCount, setLoadingCount] = useState(0);

    useEffectAsync(async () => {
        if (course) {
            if (course.isDev) {
                setButtonText('DEV Content Changes/Fixes')
            } else if (course.isBlueprint) {
                setButtonText('BP Content Fixes')
            } else {
                setButtonText("Can Only Fix from BP or DEV")
            }
        }
    }, [course]);

    /* increment and decrement is loading just in case we end up setting it asynchronously somehow */
    function startLoading() {
        setLoadingCount(1);
        console.log(loadingCount, '+');
        setFailedItems([]);
        setAffectedItems([]);
        setUnaffectedItems([]);
    }
    function endLoading() {
        setLoadingCount(0);
        console.log(loadingCount, '-');
        if(loadingCount < 0) throw new MismatchedUnloadError();
    }

    function isLoading() {
        return loadingCount > 0;
    }

    async function removeLmAnnotations() {
        assert(course);
        startLoading();

        function pageToLink (page:Page) {
            return <a className="course-link" target="_blank" href={page.htmlContentUrl}>{page.name}</a>
        }
        const results = await fixLmAnnotations(course);
        setAffectedItems(results.fixedPages.map(pageToLink));
        setUnaffectedItems(results.unchangedPages.map(pageToLink));
        setFailedItems(results.failedPages.map(pageToLink));
        endLoading();
    }



    function urlRows(links: React.ReactElement[], className = 'lxd-cu') {
        return links.map((link, i) =>
            <div key={i} className={['row', className].join(' ')}>
                {link}
            </div>)
    }


    function removeAnnotations() {
        return (course?.isBlueprint && <div className={'row'}>
            <div className={'col-sm-4'}>
                <Button onClick={removeLmAnnotations} disabled={loadingCount > 0}>
                    Remove Annotation Placeholder
                </Button>
            </div>
            <div className={'col-sm-8'}>Removes annotation placeholders on Learning Material pages</div>
        </div>)
    }

    return (course && <>
        <Button disabled={isDisabled} className={"ui-button"} onClick={(e) => setShow(true)}
        >{buttonText}</Button>
        <Modal isOpen={show} requestClose={() => setShow(false)} canClose={!loadingCount}>
            <h2>Content Fixes for {course.name}</h2>
            {course.isBlueprint && removeAnnotations()}
            <UpdateStartDate
                setAffectedItems={setAffectedItems}
                setUnaffectedItems={setUnaffectedItems}
                setFailedItems={setFailedItems}
                refreshCourse={refreshCourse}
                course={course}
                isDisabled={loadingCount > 0}
                startLoading={startLoading}
                endLoading={endLoading}
            />
            <hr/>
            {affectedItems.length > 0 && <h3>Fixes Succeeded</h3>}
            {urlRows(affectedItems, 'lxd-cu-success')}
            {unaffectedItems.length > 0 && <h3>Fix not Needed</h3>}
            {urlRows(unaffectedItems, 'lxd-cu-fail')}
            {failedItems.length > 0 && <h3>Fix is Broken, Content Unchanged</h3>}
            {urlRows(failedItems, 'lxd-cu-fail')}
        </Modal>
    </>)
}


