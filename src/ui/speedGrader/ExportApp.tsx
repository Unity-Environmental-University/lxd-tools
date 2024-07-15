import "./speedGrader.scss"
import React, {useEffect, useState} from "react";

import assert from "assert";

import {Course} from "@/canvas/course/Course";
import {Assignment, getAssignmentData} from "@/canvas/content/assignments";
import ModalDialog from "@/ui/speedGrader/controls/ModalDialog";
import DateRangeExportDialog from "@/ui/speedGrader/controls/DateRangeExportDialog";

import ExportOneButton from "@/ui/speedGrader/controls/ExportOneButton";
import ExportAllButton from "@/ui/speedGrader/controls/ExportAllButton";
import {getCourseById, getCourseIdFromUrl, getSingleCourse} from "@/canvas/course";
import {useEffectAsync} from "@/ui/utils";
import * as url from "url";
import {IAssignmentData} from "@/canvas/content/types";


export type ExportAppProps = {
    initialCourse?: Course | undefined,
    initialAssignment?: IAssignmentData | undefined,
}




function ExportApp({initialCourse, initialAssignment}: ExportAppProps) {

    const [course, setCourse] = useState<Course | null | undefined>(initialCourse);
    const [assignment, setAssignment] = useState<IAssignmentData | undefined>(initialAssignment)
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [canClose, setCanClose] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('Error');
    const [header, setHeader] = useState<string>('Alert');
    const [multiTermModal, setMultiTermModal] = useState<boolean>(false);

    useEffectAsync(async () => {
        if (!course) {
            const id = getCourseIdFromUrl(document.documentURI);
            if (id) setCourse(await getCourseById(id));
        }
    }, []);

    useEffectAsync(async () => {
        if (!course) {
            setAssignment(undefined)
            return;
        }
        const urlParams = new URLSearchParams(window.location.search);
        const stringId = urlParams.get('assignment_id');
        const assignmentId = stringId? parseInt(stringId) : undefined;
        if (assignmentId && !assignment) {
            const data = await getAssignmentData(course.id, assignmentId)
            const assignment = assignmentId ? await getAssignmentData(course?.id, assignmentId) : undefined;
            setAssignment(assignment);
        }
    }, [course])

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
        {assignment && <ExportOneButton {...handlerProps} {...{course, assignment}} />}
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