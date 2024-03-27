import "./publish.scss"
import React, {MouseEventHandler, useEffect, useState} from 'react';
import {Alert, Button, Card, Col} from 'react-bootstrap'
import Modal from 'react-modal'
import {Course} from "../canvas/index";
import assert from "assert";


function PublishApp() {
    const [course, setCourse] = useState<Course | null>()
    const [show, setShow] = useState<boolean>(false)
    const [info, setInfo] = useState<string|null|boolean>(null);
    useEffect(() => {
        const getCourse = async () => {
            if(!course) setCourse(await Course.getFromUrl())
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
        if(course?.isBlueprint) {
            return (<button className="ui-button" onClick={(e) => setShow(true)}>Publish...</button>)
        }
        return null;
    }

    return (<>
        {openButton()}
        <Modal id="publish-modal" isOpen={show} onRequestClose={() => setShow(false)}>
            <div className="container">
                {info}
                <div className="row">
                    <div className="col">
                        <Button className="btn pull-end" disabled={!(course?.isBlueprint)} onClick={publishCourses}>Publish Sections</Button>
                    </div>
                </div>
            </div>
        </Modal>

    </>)
}

export default PublishApp