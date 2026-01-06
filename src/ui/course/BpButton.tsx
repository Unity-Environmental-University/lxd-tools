import React, {FormEvent, useReducer, useState} from "react";
import {ICourseData} from "@/canvas/courseTypes";
import {useEffectAsync} from "@/ui/utils";
import {genBlueprintDataForCode} from "@/canvas/course/blueprint";
import assert from "assert";
import openThisContentInTarget from "@/canvas/content/openThisContentInTarget";
import {Button, Col, Row} from "react-bootstrap";
import Modal from "@/ui/widgets/Modal";
import {Course} from "@/canvas/course/Course";
import {listDispatcher} from "@/ui/reducerDispatchers";

import {bMinusASortFn} from "@/utils/toolbox";


type BpButtonProps = {
    course: Course,
    currentBp?: Course,
}

export function BpButton({course, currentBp}: BpButtonProps) {
    const [bps, dispatchBps] = useReducer(listDispatcher<ICourseData>, [])
    const [open, setOpen] = useState(false);
    useEffectAsync(async () => {
        dispatchBps({clear: true});
        const bpGen = genBlueprintDataForCode(course.courseCode, [course.accountId])
        if(!bpGen) {
            dispatchBps({set: []});
            return;
        }
        const loadBps:ICourseData[] = [];
        let i = 0;
        for await (const bp of bpGen) {
            loadBps.push(bp);
            dispatchBps({ set: loadBps})

            i++;
        }
    }, [course]);

    async function openMainBp(e: FormEvent) {
        assert(currentBp, "Attempted to open main BP with no BP")
        await openThisContentInTarget(course.id, currentBp.id);
    }

    const isBpDisabled = !currentBp;
    const otherBps = currentBp ? bps.filter(bp => bp.id !== currentBp.id) : bps;
    const isBpsDisabled = otherBps.length === 0;

    const bpBtnTitle = isBpDisabled ? "No current BP" : "Open the blueprint version of this course";
    const bpsBtnTitle = isBpsDisabled ? "No other BPs" : "Show archived BPs";

    return <>
        <Col>
        <Button
            title={bpBtnTitle}
            onClick={openMainBp}
            disabled={currentBp?.id === course.id || isBpDisabled}
        >BP</Button>
        <Button
            onClick={e => setOpen(true)}
            title={bpsBtnTitle}
            disabled = {isBpsDisabled}
        >BPs</Button>
        <Modal isOpen={open} requestClose={() => setOpen(false)}>
            {bps.toSorted(bMinusASortFn((a) => a.id)).map((bp, i) =>
                <Row
                    key={`${bp.id}-${i}`}
                ><Button

                    onClick={e => openThisContentInTarget(course, bp.id)}
                >{bp.course_code}</Button></Row>)}
        </Modal>
        </Col>
    </>
}