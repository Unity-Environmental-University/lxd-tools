import React, {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import Modal from "../ui/widgets/Modal/index";

import {Course} from "../canvas/index";

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
    const [sourceCourse, setSourceCourse] = useState<Course | null>(null);
    const [potentialSources, setPotentialSources] = useState<Course[]>([]);
    const [migrationUpdate, setMigrationUpdate] = useState<MigrationStatusUpdate | undefined>()

    useEffect(() => {
        course.getParentCourse().then((course) => {
            if (course) {
                setSourceCourse(course);

            }
        })
    }, [course])

    async function importDev() {
        if (!sourceCourse) return;
        await course.importCourse(sourceCourse, (current, total, message) => {
            setMigrationUpdate({
                current,
                total,
                message
            })
        });
    }

    return (<>
        <Button className={'ui-btn'}>Reset/Import Dev</Button>
        <Modal isOpen={show} requestClose={() => setShow(false)}>

        </Modal>
    </>)

}

export default ResetCourse