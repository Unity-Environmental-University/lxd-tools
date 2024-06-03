import {Course} from "../canvas/course/index";
import {Button, Col, Row} from "react-bootstrap";
import {useState} from "react";
import {useEffectAsync} from "../ui/utils";
import {getBlueprintsFromCode, IBlueprintCourse} from "../canvas/course/blueprint";
import assert from "assert";


export interface IMakeBpProps {
    devCourse: Course,
}

export function MakeBp({devCourse}:IMakeBpProps) {
    const [isDev, setIsDev] = useState(devCourse.isDev);
    const [currentBp, setCurrentBp] = useState<Course | null>()

    useEffectAsync(async () => {
        setIsDev(devCourse.isDev);
        assert(devCourse.parsedCourseCode);

        const [bp] = await getBlueprintsFromCode(devCourse.parsedCourseCode, [
            devCourse.rawData.account_id,
            devCourse.rawData.root_account_id
        ]) ?? [];

        setCurrentBp( bp)
    }, [devCourse])


    async function onArchive() {

    }

    return <div>
        {!currentBp && <Row><Col className={'alert alert-warning'}>Cannot find Existing Blueprint</Col></Row>}
        {!isDev && <Row><Col className={'alert alert-warning'}>This is not a DEV course</Col></Row>}
        {currentBp && <Row>
            <Col>
                <Button onClick={onArchive}>Archive and Replace {currentBp.parsedCourseCode}</Button>
            </Col>
        </Row>}
    </div>
}

function retireBp(bp:IBlueprintCourse) {
    const name = bp.name;
    const code = bp.courseCode;

}