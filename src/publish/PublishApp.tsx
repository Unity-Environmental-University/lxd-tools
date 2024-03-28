import "./publish.scss"
import React, {useEffect, useState} from 'react';
import {Button} from 'react-bootstrap'
import {Course} from "../canvas";
import assert from "assert";
import Modal from "../ui/modal"
import {IUserData} from "../canvas/canvasDataDefs";

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
                }
                setCourse(tempCourse)
                setIsBlueprint(tempCourse?.isBlueprint)
            }

        }

        getCourse().then();
    }, [course]);

    function finishedPublishing() {
        setInfo('Finished Publishing')
    }

    async function publishCourses(event: React.MouseEvent) {
        const courses: Course[] = await course?.getAssociatedCourses() ?? [];
        const accountId = course?.getItem<number>('account_id');
        assert(accountId);
        await Course.publishAll(courses, accountId);
        finishedPublishing();
    }

    function openButton() {

            return (course && <Button disabled={!isBlueprint}
                            className="ui-button"
                            onClick={(e) => setShow(true)}
            >{isBlueprint ? "Publish Sections.." : "Not A Blueprint"}</Button>)
    }

    function associatedCoursesTable() {
        return (<>
            {associatedCourses && associatedCourses.map((course) => (<CourseRow course={course}/>))}
        </>)
    }

    return (<>
        {openButton()}
        <Modal id={'lxd-publish-interface'} isOpen={show} requestClose={() => setShow(false)}>
            <div className={'container'}>
                <div className='row'>
                    <div className='col-sm-8'>
                        Click this button to publish all sections associated with this blueprint. These sections are:
                        {associatedCoursesTable()}
                    </div>
                    <div className='col-sm-4'>
                        <Button className="btn pull-end" disabled={!(course?.isBlueprint)} onClick={publishCourses}>Publish
                            Sections</Button>

                    </div>
                </div>
            </div>
            {info && <div className={'alert alert-primary'}>{info}</div>}
        </Modal>
    </>)
}

type CourseRowProps = {
    course: Course,
}
function CourseRow({ course }:CourseRowProps) {

    const [instructors, setInstructors] = useState<IUserData[]>([])
    useEffect(() => {
        if(!instructors) {
            course.getInstructors().then((instructors) => instructors && setInstructors(instructors));
        }
    }, [course, instructors])

    return (<div className={'row'}>
        <div className={'col-sm-6'}>{course.courseCode}</div>
        <div className={'col-sm-6'}>{instructors.map((instructor) => instructor.name).join(', ')}</div>
    </div>)
}

export default PublishApp

