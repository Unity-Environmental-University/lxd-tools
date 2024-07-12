// noinspection SpellCheckingInspection

import "./speedGrader.scss"
import React, {useEffect, useState} from "react";

import assert from "assert";

import {Course} from "../../canvas/course/Course";
import {Assignment} from "@/canvas/content/assignments";
import {ModalDialog} from "@/ui/speedGrader/controls/ModalDialog";
import {DateRangeExportDialog} from "@/ui/speedGrader/controls/DateRangeExportDialog";

import {ExportOneButton} from "@/ui/speedGrader/controls/ExportOneButton";
import {ExportAllButton} from "@/ui/speedGrader/controls/ExportAllButton";


function ExportApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('assignment_id');

    const [course, setCourse] = useState<Course | null>();
    const [assignment, setAssignment] = useState<Assignment | null>()
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [canClose, setCanClose] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('Error');
    const [header, setHeader] = useState<string>('Alert');
    const [multiTermModal, setMultiTermModal] = useState<boolean>(false);

    useEffect(() => {
        async function getCourseAndAssignment() {
            if (!course) {
                const course = await Course.getFromUrl();
                setCourse(course);
            }
            if (!assignment) {
                assert(course);
                const assignment = assignmentId ? (await Assignment.getById(parseInt(assignmentId), course.id)) as Assignment : null;
                setAssignment(assignment);
            }
        }

        getCourseAndAssignment().then();
    }, [course]);

    function popUp(text: string, header: string = "Alert", closeButton: boolean = false) {
        setMessage(text);
        setHeader(header);
        setCanClose(closeButton);
        setModalOpen(true)
    }

    function popClose() {
        setModalOpen(false);
    }

    function showError(event: ErrorEvent) {
        popUp(event.message, "Error", true);
        window.removeEventListener("error", showError);
    }

    const handlerProps = {
        popUp, popClose, showError
    }


    return (course && <>
        {assignment && <ExportOneButton {...handlerProps} { ...{course, assignment}} />}
        <ExportAllButton {...handlerProps} {...{course}}/>
        <button onClick={(event) => {
            setMultiTermModal(true);
            event.preventDefault();
            return false
        }}>...
        </button>

        <ModalDialog canClose={canClose} show={modalOpen} header={header} message={message}>
        </ModalDialog>
        <DateRangeExportDialog
            show={multiTermModal}
            course={course}
            handleHide={() => setMultiTermModal(false)}
            handleShow={() => setMultiTermModal(true)}
            onExporting={() => {
                popUp("Exporting")
            }}
            onFinishedExporting={() => {
                console.log("Finished Exporting")
                popClose();
            }}
        ></DateRangeExportDialog>
    </>)
}


// @ts-ignore
export default ExportApp