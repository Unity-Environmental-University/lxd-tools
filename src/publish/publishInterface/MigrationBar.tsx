import {getMigrationProgressGen, IMigrationData, IProgressData} from "../../canvas/course/migration";
import {Course} from "../../canvas/course/Course";
import {useState} from "react";
import {useEffectAsync} from "../../ui/utils";
import {Col, ProgressBar, Row} from "react-bootstrap";

type MigrationBarProps = {
    migration: IMigrationData,
    course: Course,
}

export function MigrationBar({migration, course}: MigrationBarProps) {
    const [progress, setProgress] = useState<IProgressData>()

    useEffectAsync(async () => {
        let progressGen = getMigrationProgressGen(migration);
        for await(let progress of progressGen) {
            setProgress(progress);
        }
    }, [migration]);


    return <Row>
        <Col sm={4} style={{fontSize: '0.5em'}}>
            <Row>
                Status: {progress?.workflow_state}

            </Row>
            <Row>
                Started: {migration.started_at}
            </Row>
        </Col>
        <Col sm={8}>
            <ProgressBar
                min={0}
                max={100}
                now={progress?.completion}/>
        </Col>
    </Row>

}