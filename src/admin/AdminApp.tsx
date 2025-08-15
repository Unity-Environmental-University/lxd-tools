import React, {useEffect, useReducer, useState} from "react";
import {IMultiSelectOption, optionize, optionizeOne} from "@/ui/widgets/MuliSelect";
import Modal from "@/ui/widgets/Modal/index";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import {batchify, filterUniqueFunc} from "@/canvas/canvasUtils";
import {ValidationRow} from "@/publish/fixesAndUpdates/ValidationRow";
import {listLutDispatcher, lutDispatcher} from "@/ui/reducerDispatchers";
import {IIncludesTestAndCourseId} from "./index";
import {SearchCourses} from "./SearchCourses";
import {SelectValidations} from "./SelectValidations";
import {Course} from "@/canvas/course/Course";
import {beginBpSync} from "@/canvas/course/blueprint";
import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";


interface IAdminAppProps {
    course?: Course,
    allValidations: CourseValidation<Course, any, any>[]
}

export function AdminApp({course, allValidations}: IAdminAppProps) {
    const [isOpen, setIsOpen] = useState(false);

    const [foundCourses, setFoundCourses] = useState<(Course & IMultiSelectOption)[]>([]);
    const [coursesToRunOn, setCoursesToRunOn] = useState<(Course & IMultiSelectOption)[]>([]);
    useEffect(() => {
        if (course) {
            setCoursesToRunOn(optionize([course]));
        }
    }, [course]);


    const [validationsToRun, setValidationsToRun] = useState<(CourseValidation & IMultiSelectOption)[]>([])
    const [validationResults, setValidationResults] = useState<IIncludesTestAndCourseId[]>([])

    const [onlySearchBlueprints, setOnlySearchBlueprints] = useState(false);

    const [
        validationResultsLut,
        dispatchValidationResultsLut
    ] = useReducer(listLutDispatcher<number, IIncludesTestAndCourseId>, {});

    const [includeLegacyBps, setIncludeLegacyBps] = useState(false);
    const [includeDev, setIncludeDev] = useState(false);
    const [includeSections, setIncludeSections] = useState(false);

    const [isValidating, setIsValidating] = useState(false);

    const [
        parentCourseLut
        , dispatchParentCourseLut
    ] = useReducer(lutDispatcher<number, Course | null>, {});
    const [sectionLut, dispatchSectionLut] = useReducer(listLutDispatcher<number, Course>, {})

    function cacheAssociatedCourses(bpId: number, toAdd: Course[] | Course) {
        const sections = Array.isArray(toAdd) ? toAdd : [toAdd];
        console.log(bpId, sections.map(a => a.parsedCourseCode))
        dispatchSectionLut({add: [bpId, sections]});
    }

    function cacheParentCourse(bpId: number, toAdd: Course | null) {
        dispatchParentCourseLut({set: [bpId, toAdd]})
    }

    async function getAssociatedCourses(course: Course) {
        const cached = sectionLut[course.id];
        if (cached) return cached;
        if (!cached) {
            const associatedCourses = await course.getAssociatedCourses();
            cacheAssociatedCourses(course.id, associatedCourses);
            return associatedCourses
        }

    }

    async function getParentCourse(course: Course) {
        const cached = parentCourseLut[course.id];
        if (cached || cached === null) return cached;
        const parentCourse = await course.getParentCourse(true) || null;
        cacheParentCourse(course.id, parentCourse);
        return parentCourse;
    }

//Handlers
    async function runTests() {
        if (isValidating) return false;
        setIsValidating(true);
        let allTestResults: typeof validationResults = [];
        let coursesToValidate: typeof coursesToRunOn = [];


        for (const course of coursesToRunOn) {
            coursesToValidate = [...coursesToValidate, course].filter(filterUniqueFunc);
            if (includeDev) {
                const dev = await getParentCourse(course);
                if (dev) {
                    cacheParentCourse(course.id, dev);
                    coursesToValidate = [...coursesToValidate, optionizeOne(dev)];
                }

            }
            if (includeSections) {
                const sections = await getAssociatedCourses(course);
                cacheAssociatedCourses(course.id, sections ?? [])
                if (sections) coursesToValidate = [...coursesToValidate, ...optionize(sections)];
            }
        }

        async function getTestResultOption(
            course: typeof coursesToRunOn[number],
            test: typeof validationsToRun[number],
        ) {
            const result = await test.run(course);
            return {
                ...result,
                courseId: course.id,
                test,
            }
        }

        for (const batch of batchify(coursesToValidate, 2)) {

            for (const test of validationsToRun) {
                console.log('running', test.name);
                const testResults = await Promise.all(batch.map((course) => getTestResultOption(course, test)));

                for (const result of testResults) {
                    dispatchValidationResultsLut({
                        add: [result.courseId, [result]]
                    })
                }
                allTestResults = [...allTestResults, ...testResults].toSorted((a, b) => {
                    return a.test.name.localeCompare(b.test.name);
                })
                setValidationResults(allTestResults);
                console.log(allTestResults);
            }
        }
        setIsValidating(false);
    }


    function ResultsDisplay() {
        return <Row>
            <Col>
                <Row>
                    {coursesToRunOn.map(course => <ResultsDisplayRow
                        course={course}
                        key={course.id}
                        parentCourse={parentCourseLut[course.id]}
                        sections={sectionLut[course.id]}
                    />)}
                </Row>
                <Row>
                    {validationResults
                        .filter(a => a.success !== true)
                        .map(result => {
                            const course = coursesToRunOn.find(a => a.id === result.courseId);

                            return course && <Row>
                                <Col sm={4}>
                                    {course?.courseCode}
                                </Col>
                                <Col sm={4}>
                                    {course.courseCode}
                                </Col>
                                <Col sm={4}>
                                    <CourseLink course={course} label={course.htmlContentUrl}/>
                                </Col>
                            </Row>
                        })}
                </Row>
            </Col>
        </Row>
    }

    interface IResultsDisplayRowProps {
        course: Course,
        parentCourse?: Course | null,
        sections?: Course[] | null
    }

    function ResultsDisplayRow({
        course, parentCourse, sections
    }: IResultsDisplayRowProps) {
        return <Row>
            <ValidationResultsForCourse
                key={course.id}
                slim={false}
                results={validationResultsLut[course.id]}
                course={course}/>

            {includeDev && parentCourse && <ValidationResultsForCourse
                key={course.id}
                slim={true}
                course={parentCourse}
                results={validationResultsLut[parentCourse.id]}
            />}
            {includeSections && sections?.map(section => <ValidationResultsForCourse
                key={section.id}
                slim={true}
                course={section}
                results={validationResultsLut[section.id]}
            />)}


        </Row>
    }

    function FoundCoursesDisplay() {
        return <>
            <button
                onClick={() => setCoursesToRunOn(Array.from(new Set([...coursesToRunOn, ...foundCourses])))}
            >Add All
            </button>
            <button onClick={() => setFoundCourses([])}>Clear</button>

            {foundCourses.map(course =>
                <Row key={course.id}><Col>{course.label ?? course.parsedCourseCode ?? course.name}</Col><Col>
                    <button
                        onClick={() => setCoursesToRunOn([...coursesToRunOn, course])}>{'ADD'}</button>
                </Col></Row>
            )
            }
        </>

    }

    return <>
        <button onClick={() => setIsOpen(true)}>Admin</button>
        <Modal isOpen={isOpen} requestClose={() => setIsOpen(false)}>
            <Container>
                <Row>
                    <Col sm={9}>
                        <Row>
                            <Col sm={4}>
                                <Form.Label>Only Search Blueprints</Form.Label>
                                <Form.Check
                                    checked={onlySearchBlueprints}
                                    onChange={(e) => setOnlySearchBlueprints(e.target.checked)}
                                />
                            </Col>
                            {onlySearchBlueprints && <Col sm={2}>
                                <Form.Label>Legacy BPs</Form.Label>
                                <Form.Check checked={includeLegacyBps}
                                            onChange={(e) => setIncludeLegacyBps(e.target.checked)}/>
                            </Col>}
                            {onlySearchBlueprints && <Col sm={3}>
                                <Form.Label>Include Dev</Form.Label>
                                <Form.Check checked={includeDev} onChange={(e) => setIncludeDev(e.target.checked)}/>
                            </Col>}
                            {onlySearchBlueprints && <Col sm={3}>
                                <Form.Label>Include Sections</Form.Label>
                                <Form.Check checked={includeSections}
                                            onChange={(e) => setIncludeSections(e.target.checked)}/>
                            </Col>}
                        </Row>
                        <Row>
                            <Col>
                                <SearchCourses
                                    setFoundCourses={setFoundCourses}
                                    onlySearchBlueprints={onlySearchBlueprints}
                                    includeLegacyBps={includeLegacyBps}
                                    setIsSearching={() => null}
                                />
                            </Col>{coursesToRunOn.length > 0 && <Col>
                            <SelectValidations
                                runValidations={runTests}
                                allValidations={allValidations}
                                validationsToRun={validationsToRun}
                                setCoursesToRunOn={(courses) => optionize(courses)}
                                onChangeCustomValidation={() => null}
                                setValidationsToRun={setValidationsToRun}/>
                        </Col>}
                        </Row>

                        <Row>
                            <Col>
                                Results
                                <ResultsDisplay/>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={3}>
                        <FoundCoursesDisplay/>
                    </Col>
                </Row>
            </Container>
        </Modal>
    </>
}


interface IValidationResultsForCourseProps {
    results?: IIncludesTestAndCourseId[],
    slim?: boolean,
    course
        :
        Course,
}


function ValidationResultsForCourse({
    course, results, slim
}: IValidationResultsForCourseProps) {
    async function sync() {
        await beginBpSync(course.id, {
            message: `Syncing from fix ${results?.map(a => a.test.name).join(',')}`
        })
    }

    return <>


        <Row><Col>
            <h3 style={{fontSize: slim ? '0.5em' : '1em'}}>
                <a href={course.htmlContentUrl} target={'_blank'}>{course.parsedCourseCode ?? course.name}</a>
                {course.isBlueprint() && <Button onClick={sync}>Sync</Button>}

            </h3>
        </Col></Row>
        {
            results && results.map((result, i) => <ValidationRow
                key={result.test.name + course.id + "_" + i}
                course={course}
                slim={slim}
                initialResult={result}
                test={result.test}
                potemkinVillage={true}
                refreshCourse={async () => undefined}
            />)
        }
    </>
}


export type CourseLinkProps = {
    course: Course, label?: string
}

function CourseLink({
    course, label
}: CourseLinkProps) {

    return <a href={course.htmlContentUrl} target={"_blank"}>{label ?? course.name}</a>
}