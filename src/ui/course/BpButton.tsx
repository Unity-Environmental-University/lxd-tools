import React, {FormEvent, useReducer, useState} from "react";
import {ICourseData} from "@/canvas/courseTypes";
import {useEffectAsync} from "@/ui/utils";
import {genBlueprintDataForCode} from "@/canvas/course/blueprint";
import {renderAsyncGen} from "@/canvas/fetch";
import assert from "assert";
import openThisContentInTarget from "@/canvas/content/openThisContentInTarget";
import {Button, Col, Row} from "react-bootstrap";
import Modal from "@/ui/widgets/Modal";
import {Course} from "@/canvas/course/Course";
import {listDispatcher} from "@/ui/reducerDispatchers";
import {aMinusBSortFn, bMinusASortFn} from "@/index";

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
        if(!bpGen) return;
        const loadBps:ICourseData[] = [];
        let i = 0;
        for await (let bp of bpGen) {
            console.log(i);
            loadBps.push(bp);
            dispatchBps({ set: loadBps})
            console.log(bp, bps);
            i++;
        }
    }, [course]);

    async function openMainBp(e: FormEvent) {
        assert(currentBp, "Attempted to open main BP with no BP")
        await openThisContentInTarget(course.id, currentBp.id);
    }
    if (!currentBp && bps.length === 0) return <Button disabled={true}>No BPs Found</Button>;
    return <>
        <Col>
        <Button
            title={"Open the blueprint version of this course"}
            onClick={openMainBp}
        >BP</Button>
            {bps.length > 1 && <>
        <Button
            onClick={e => setOpen(true)}
            title={"Show archived BPs"}
        >BPs</Button>
        <Modal isOpen={open} requestClose={() => setOpen(false)}>
            {bps.toSorted(bMinusASortFn((a) => a.id)).map(bp =>
                <Row><Button
                    key={bp.id}
                    onClick={e => openThisContentInTarget(course, bp.id)}
                >{bp.course_code}</Button></Row>)}
        </Modal></>}
        </Col>
    </>
}