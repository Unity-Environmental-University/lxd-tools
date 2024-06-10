import {Course, createNewCourse} from "../canvas/course/index";
import {Button, Col, Row} from "react-bootstrap";
import {FormEvent, useEffect, useState} from "react";
import {useEffectAsync} from "../ui/utils";
import {
    getBlueprintsFromCode,
    getSections,
    getTermNameFromSections,
    IBlueprintCourse,
    retireBlueprint
} from "../canvas/course/blueprint";
import assert from "assert";
import {bpify} from "../admin/index";
import {getMigrationProgressGen, IMigrationData, IProgressData, startMigration} from "../canvas/course/migration";


export interface IMakeBpProps {
    devCourse: Course,
    onBpSet?: (bp: Course | null | undefined) => void,
    onTermNameSet?: (termName: string | undefined) => void,
    onSectionsSet?: (sections: Course[]) => void,
    onProgressUpdate?: (progress:IProgressData|undefined) => void,
}



function callOnChangeFunc<T, R>(value:T, onChange:((value:T)=>R )| undefined) {
    const returnValue :[() => any, [T]] = [() => {
        onChange && onChange(value);
    }, [value]];
    return returnValue;
}

export function MakeBp({
    devCourse,
    onBpSet,
    onTermNameSet,
    onSectionsSet,
    onProgressUpdate,
}: IMakeBpProps) {
    const [isDev, setIsDev] = useState(devCourse.isDev);
    const [currentBp, setCurrentBp] = useState<Course | null>()
    const [isLoading, setIsLoading] = useState(false);
    const [sections, setSections] = useState<Course[]>([])
    const [termName, setTermName] = useState<string | undefined>()
    const [progressData, setProgressData] = useState<IProgressData|undefined>();

    useEffect(...callOnChangeFunc(currentBp, onBpSet));
    useEffect(...callOnChangeFunc(termName, onTermNameSet));
    useEffect(...callOnChangeFunc(sections, onSectionsSet));
    useEffect(...callOnChangeFunc(progressData, onProgressUpdate));

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
        if(!currentBp) {
            console.warn("Tried to clone without a bp")
            return;
        }
        if(typeof devCourse.parsedCourseCode !== 'string') {
            console.warn('Dev course does not have a recognised course code');
            return;
        }

        const newBpShell = await createNewCourse(bpify(devCourse.parsedCourseCode));
        const migration = await startMigration(devCourse.id, newBpShell.id);
        const migrationStatus = getMigrationProgressGen(migration);
        for await(let progress of migrationStatus) {
            setProgressData(progress);
        }
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
                    onClick={onCloneIntoBp}
                    disabled={isLoading || !!currentBp || !termName || termName.length === 0}
                ></Button>
            </Col>
        </Row>}
    </div>
}

