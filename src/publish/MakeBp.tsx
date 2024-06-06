import {Course} from "../canvas/course/index";
import {Button, Col, Row} from "react-bootstrap";
import {FormEvent, useState} from "react";
import {useEffectAsync} from "../ui/utils";
import {
    getBlueprintsFromCode,
    getSections,
    getTermNameFromSections,
    IBlueprintCourse,
    retireBlueprint
} from "../canvas/course/blueprint";
import assert from "assert";


export interface IMakeBpProps {
    devCourse: Course,
}

export function MakeBp({devCourse}:IMakeBpProps) {
    const [isDev, setIsDev] = useState(devCourse.isDev);
    const [currentBp, setCurrentBp] = useState<Course | null>()
    const [isLoading, setIsLoading] = useState(false);
    const [sections, setSections] = useState<Course[]>([])
    const [termName, setTermName] = useState<string|undefined>()

    useEffectAsync(async () => {
        setIsDev(devCourse.isDev);
        if(devCourse.parsedCourseCode) {
            await updateBpInfo(devCourse, devCourse.parsedCourseCode);
        }
    }, [devCourse])

    async function updateBpInfo(course:Course, code:string) {
            const [bp] = await getBlueprintsFromCode(code, [
            devCourse.rawData.account_id,
            devCourse.rawData.root_account_id
        ]) ?? [];
        setCurrentBp(bp)

    }

    useEffectAsync(async () => {
        if(currentBp && currentBp.isBlueprint()) {
            const sections = await getSections(currentBp);
            setSections(sections);
            try {
                setTermName(await getTermNameFromSections(sections))
            } catch(e) {
                console.warn(e);
                setTermName(undefined)
            }
        }
    }, [currentBp])

    async function onArchive(e:FormEvent) {
        e.preventDefault();
        assert(devCourse.parsedCourseCode, "We should never be able to call this function if devcourse doesn't have a valid code")
        if(!currentBp) return false;
        if(!termName) return false;
        setIsLoading(true);
        await retireBlueprint(currentBp, termName);

        await updateBpInfo(devCourse, devCourse.parsedCourseCode); //this should set bp as empty
        await onCloneIntoBp(e);
        setIsLoading(false);
    }

    async function onCloneIntoBp(e:FormEvent) {
        e.preventDefault();
    }

    return <div>
        {!currentBp && <Row><Col className={'alert alert-warning'}>Cannot find Existing Blueprint</Col></Row>}
        {!isDev && <Row><Col className={'alert alert-warning'}>This is not a DEV course</Col></Row>}
        {currentBp && <Row>
            <Col>
                <label>Term Name</label>
            </Col>
            <input
                id={'archiveTermName'}
                typeof={'text'}
                value={termName}
                onChange={e => setTermName(e.target.value)}
                placeholder={'This should autofill if bp exists and has sections'}
            />
            <Col>
                <Button
                    id={'archiveButton'}
                    onClick={onArchive}
                    disabled={isLoading || !currentBp || !termName || termName.length === 0}
                >Archive and Replace {currentBp.parsedCourseCode}</Button>
            </Col>
        </Row>}
    </div>
}

