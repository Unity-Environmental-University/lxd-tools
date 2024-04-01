import "./publish.scss"
import React, {useEffect, useState} from 'react';
import {Button} from 'react-bootstrap'
import {Course} from "../canvas";
import assert from "assert";
import Modal from "../ui/widgets/Modal"
import PublishCourseRow from "./PublishCourseRow"

console.log("running")

function PublishApp() {
    const [course, setCourse] = useState<Course | null>()
    const [show, setShow] = useState<boolean>(false)
    const [info, setInfo] = useState<string | null | boolean>(null);
    const [associatedCourses, setAssociatedCourses] = useState<Course[]>([])
    const [isBlueprint, setIsBlueprint] = useState<boolean>(false);
    useEffect(() => {
        const getCourse = async () => {
            if (!course) {
                const tempCourse = await Course.getFromUrl();
                if (tempCourse) {
                    setAssociatedCourses(await tempCourse.getAssociatedCourses() ?? [])
                    setCourse(tempCourse)
                    setIsBlueprint(tempCourse?.isBlueprint)
                }
            }
        }
        getCourse().then();
    }, [course]);


    async function publishCourses(event: React.MouseEvent) {
        const accountId = course?.getItem<number>('account_id');
        assert(accountId);
        await Course.publishAll(associatedCourses, accountId)
        window.setTimeout(async () => {
            let newAssocCourses = await course?.getAssociatedCourses();
            if (newAssocCourses) {
                newAssocCourses = [...newAssocCourses];
            } else {
                newAssocCourses = [];
            }
            setAssociatedCourses(newAssocCourses);
            setInfo('Finished Publishing');
        }, 500);
    }

    function openButton() {
        return (course && <Button disabled={!isBlueprint}
                                  className="ui-button"
                                  onClick={(e) => setShow(true)}
        >{isBlueprint ? "Publish Sections.." : "Not A Blueprint"}</Button>)
    }

    function openAll(e: React.MouseEvent) {
        e.stopPropagation();
        for (let course of associatedCourses) {
            window.open(course.courseUrl, "_blank");
        }

    }

    function associatedCourseRows() {
        return (<div className={'course-table'}>
            <div className={'row'}>
                <div className={'col-sm-9'}>

                    <div><strong>Code</strong></div>
                    <a href={'#'} onClick={openAll}>Open All</a>
                </div>
                <div className={'col-sm-3'}><strong>Instructor(s)</strong></div>
            </div>
            {associatedCourses && associatedCourses.map((course) => (
                <PublishCourseRow course={course}/>))}
        </div>)
    }


    return (<>
        {openButton()}
        <Modal id={'lxd-publish-interface'} isOpen={show} requestClose={() => setShow(false)}>
            <div>
                <div className='row'>
                    <div className={'col-xs-12'}>
                        <h3>Publish Sections</h3>
                    </div>
                    <div className={'col-xs-12 col-sm-8'}>
                        Publish sections associated with this blueprint
                    </div>
                    <div className='col-xs-12'>
                        {associatedCourseRows()}
                    </div>
                    <div className={'col-xs-12 button-container'}>
                        <Button className="btn" disabled={!(course?.isBlueprint)} onClick={publishCourses}>
                            Publish Sections
                        </Button>

                    </div>
                </div>
            </div>
            {info && <div className={'alert alert-primary'}>{info}</div>}
        </Modal>
    </>)
}


export default PublishApp

