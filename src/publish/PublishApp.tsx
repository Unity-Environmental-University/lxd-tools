import "./publish.scss"
import React, {useEffect, useState} from 'react';
import {Button} from 'react-bootstrap'
import {Course} from "../canvas";
import assert from "assert";
import Modal from "../ui/widgets/Modal"
import PublishCourseRow from "./PublishCourseRow"
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
                    setCourse(tempCourse)
                    setIsBlueprint(tempCourse?.isBlueprint)
                }
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
        return (<div className={'course-table'}>
            <div className={'row'}>
                <div className={'col-sm-9'}><strong>Code</strong></div>
                <div className={'col-sm-3'}><strong>Instructor(s)</strong></div>
            </div>
            {associatedCourses && associatedCourses.map((course) => (<PublishCourseRow course={course}/>))}
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
                        {associatedCoursesTable()}
                    </div>
                    <div className={'col-xs-12 button-container'}>
                        <Button className="btn" disabled={!(course?.isBlueprint)} onClick={publishCourses}>Publish Sections</Button>

                    </div>
                </div>
            </div>
            {info && <div className={'alert alert-primary'}>{info}</div>}
        </Modal>
    </>)
}


type ResetCourseProps = {
    course: Course,
    show: boolean,
}

type MigrationStatusUpdate = {
    current: number,
    total: number,
    message?: string
}

function ResetCourse({course}: ResetCourseProps) {
    const [show, setShow] = useState<boolean>(false);
    const [sourceCourse, setSourceCourse] = useState<Course|null>(null);
    const [potentialSources, setPotentialSources] = useState<Course[]>([]);
    const [migrationUpdate, setMigrationUpdate] = useState<MigrationStatusUpdate|undefined>()

    useEffect(()=>{
        course.getParentCourse().then((course) => {
            if(course) {
                setSourceCourse(course);

            }
        })
    }, [course])

    async function importDev() {
        if(!sourceCourse) return;
        await course.importCourse(sourceCourse, (current, total, message) => {
            setMigrationUpdate({
                current,
                total,
                message
            })
        });
    }

    return(<>
        <Button className={'ui-btn'}>Reset/Import Dev</Button>
        <Modal isOpen={show} requestClose={() => setShow(false)}>

        </Modal>
    </>)

}

export default PublishApp

