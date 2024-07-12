import React, {FormEvent, useState} from "react";
import {ICourseData} from "@/canvas/courseTypes";
import {useEffectAsync} from "@/ui/utils";
import {genBlueprintDataForCode} from "@/canvas/course/blueprint";
import {renderAsyncGen} from "@/canvas/fetch";
import assert from "assert";
import openThisContentInTarget from "@/canvas/content/openThisContentInTarget";
import {Button} from "react-bootstrap";
import Modal from "@/ui/widgets/Modal";
import {Course} from "@/canvas/course/Course";

type BpButtonProps = {
    course: Course,
    currentBp?: Course,
}

export function BpButton({course, currentBp}: BpButtonProps) {
    const [bps, setBps] = useState<ICourseData[]>([])
    const [open, setOpen] = useState(false);
    useEffectAsync(async () => {
        const bpGen = genBlueprintDataForCode(course.courseCode, [course.accountId, course.rootAccountId])
        setBps(bpGen ? await renderAsyncGen(bpGen) : []);
    }, [course]);

    async function openMainBp(e: FormEvent) {
        assert(currentBp, "Attempted to open main BP with no BP")
        await openThisContentInTarget(course.id, currentBp.id);
    }

    if (!currentBp || bps.length === 0) return <Button disabled={true}>No BPs Found</Button>;
    if (bps.length <= 1 && currentBp) return <Button onClick={openMainBp}>BP</Button>;
    return <>
        <Button
            title={"Open the blueprint version of this course"}
            onClick={openMainBp}
        >BP</Button>
        <Button
            onClick={e => setOpen(true)}
            title={"Show archived BPs"}
        >Archived BPs</Button>
        <Modal isOpen={open} requestClose={() => setOpen(false)}>
            {bps.map(bp =>
                <Button
                    key={bp.id}
                    onClick={e => openThisContentInTarget(course, bp.id)}
                >{bp.course_code}</Button>)}
        </Modal>
    </>
}