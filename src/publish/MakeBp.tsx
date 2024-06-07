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
    onBpSet?: (bp: Course | null | undefined) => void,
    onTermNameSet?: (termName: string | undefined) => void,
    onSectionsSet?: (sections: Course[]) => void,
}

export function MakeBp({
    devCourse,
    onBpSet,
    onTermNameSet,
    onSectionsSet
}: IMakeBpProps) {
    const [isDev, setIsDev] = useState(devCourse.isDev);
    const [currentBp, _setCurrentBp] = useState<Course | null>()
    const [isLoading, setIsLoading] = useState(false);
    const [sections, _setSections] = useState<Course[]>([])
    const [termName, _setTermName] = useState<string | undefined>()

    function setTermName(name: typeof termName) {
        _setTermName(name);
        onTermNameSet && onTermNameSet(name);
    }

    function setCurrentBp(bp: typeof currentBp) {
       _setCurrentBp(bp);
       onBpSet && onBpSet(bp);
    }

    function setSections(newSections: typeof sections) {
        _setSections(sections);
        onSectionsSet && onSectionsSet(sections);
    }

    useEffectAsync(async () => {
        setIsDev(devCourse.isDev);
        if (devCourse.parsedCourseCode) {
            await updateBpInfo(devCourse, devCourse.parsedCourseCode);
        }
    }, [devCourse])

    async function updateBpInfo(course: Course, code: string) {
        const [bp] = await getBlueprintsFromCode(code, [
            course.rawData.account_id,
            course.rawData.root_account_id
        ]) ?? [];
        setCurrentBp(bp)
    }

    useEffectAsync(async () => {
        if (currentBp && currentBp.isBlueprint()) {
            const sections = await getSections(currentBp);
            setSections(sections);
            try {
                setTermName(await getTermNameFromSections(sections))
            } catch (e) {
                console.warn(e);
                setTermName(undefined)
            }
        }
    }, [currentBp])


    async function onArchive(e: FormEvent) {
        e.preventDefault();
        if (!devCourse.parsedCourseCode) throw Error("Trying to archive without a valid course code");
        if (!currentBp) return false;
        if (!termName) return false;
        setIsLoading(true);
        await retireBlueprint(currentBp, termName);
        await updateBpInfo(devCourse, devCourse.parsedCourseCode);
        setIsLoading(false);
    }

    async function onCloneIntoBp(e: FormEvent) {
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
                >Archive {currentBp.parsedCourseCode}</Button>
                <Button
                    id={'newBpButton'}
                ></Button>
            </Col>
        </Row>}
    </div>
}

