import "./speedGrader.scss"
import React, {useEffect, useState} from "react";

import assert from "assert";

import {Course} from "@/canvas/course/Course";
import SpeedGraderModalDialog from "@/ui/speedGrader/controls/SpeedGraderModalDialog";
import DateRangeExportDialog from "@/ui/speedGrader/controls/DateRangeExportDialog";

import ExportOneButton from "@/ui/speedGrader/controls/ExportOneButton";
import ExportAllButton from "@/ui/speedGrader/controls/ExportAllButton";
import {getCourseById, getCourseData, getSingleCourse} from "@/canvas/course";
import {useEffectAsync} from "@/ui/utils";
import * as url from "url";
import getCourseIdFromUrl from "@/canvas/course/getCourseIdFromUrl";
import {ICourseData} from "@/canvas/courseTypes";
import {IAssignmentData} from "@/canvas/content/assignments/types";
import AssignmentKind from "@/canvas/content/assignments/AssignmentKind";


export type ExportAppProps = {
    initialCourse?: ICourseData | undefined,
    initialAssignment?: IAssignmentData | undefined,
}




function ExportApp({initialCourse, initialAssignment}: ExportAppProps) {

    const [course, setCourse] = useState<ICourseData | null | undefined>(initialCourse);
    const [assignment, setAssignment] = useState<IAssignmentData | undefined>(initialAssignment)
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [canClose, setCanClose] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('Error');
    const [header, setHeader] = useState<string>('Alert');
    const [multiTermModal, setMultiTermModal] = useState<boolean>(false);

    useEffectAsync(async () => {
        if (!course) {
            const id = getCourseIdFromUrl(document.documentURI);
            if (id) setCourse(await getCourseData(id));
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
            const data = await AssignmentKind.get(course.id, assignmentId)
            const assignment = assignmentId ? await AssignmentKind.get(course?.id, assignmentId) : undefined;
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

        <SpeedGraderModalDialog canClose={canClose} show={modalOpen} header={header} message={message}>
        </SpeedGraderModalDialog>
        <DateRangeExportDialog
            show={multiTermModal}
            course={course}
            handleHide={() => setMultiTermModal(false)}
            handleShow={() => setMultiTermModal(true)}
            onExporting={() => {
                popUp("Exporting")
            }}
            onFinishedExporting={() => {
                popClose();
            }}
        ></DateRangeExportDialog>
    </>)
}


// @ts-ignore
export default ExportApp