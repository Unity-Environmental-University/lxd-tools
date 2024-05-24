import {Course, getCourseGenerator} from "../canvas/course/index";
import React, {FormEventHandler, useEffect, useState} from "react";
import {
    CourseValidationTest,
    ValidationTestResult
} from "../publish/fixesAndUpdates/validations/index";
import courseContent from "../publish/fixesAndUpdates/validations/courseContent";
import courseSettings from "../publish/fixesAndUpdates/validations/courseSettings";
import syllabusTests from "../publish/fixesAndUpdates/validations/syllabusTests";
import MultiSelect, {IMultiSelectOption, optionize} from "../ui/widgets/MuliSelect";
import {useEffectAsync} from "../ui/utils";
import Modal from "../ui/widgets/Modal/index";
import {Col, Container, Form, Row} from "react-bootstrap";
import {batchify} from "../canvas/canvasUtils";
import {ValidationRow} from "../publish/fixesAndUpdates/ValidationRow";
import {Account} from "../canvas/index";
import onSelectionChanged = chrome.tabs.onSelectionChanged;
import {selectOptions} from "@testing-library/user-event/dist/select-options";


interface IAdminAppProps {
    course: Course | null,
}

const tests: CourseValidationTest[] = [
    ...courseContent,
    ...courseSettings,
    ...syllabusTests,
]

function getTestName(test: CourseValidationTest) {
    return test.name;
}

interface IIncludesTestAndCourseId extends ValidationTestResult {
    test: CourseValidationTest,
    courseId: number,
}

export function AdminApp({course}: IAdminAppProps) {
    const [courseSearchString, setCourseSearchString] = useState('');
    const [seekCourseCodes, setSeekCourseCodes] = useState<string[]>([]);
    const [foundCourses, setFoundCourses] = useState<(Course & IMultiSelectOption)[]>([]);
    const [coursesToRunOn, setCoursesToRunOn] = useState<(Course & IMultiSelectOption)[]>([])
    const [allValidations, _] = useState(optionize(tests, getTestName, getTestName))
    const [testsToRun, setTestsToRun] = useState<(CourseValidationTest & IMultiSelectOption)[]>([])
    const [isOpen, setIsOpen] = useState(false);
    const [onlySearchBlueprints, setOnlySearchBlueprints] = useState(true);
    const [isTesting, setIsTesting] = useState(false);
    const [testResults, setTestResults] = useState<IIncludesTestAndCourseId[]>([])
    const [isSearching, setIsSearching] = useState(false);
    const courseCache: Record<string, Course[]> = {};


    function bpify(code: string) {
        let [, prefix] = code.match(/^([^_]*)_/) || [null, ''];
        let [, body] = code.match(`${prefix || ''}_?(.*)`) || [null, code];
        return `BP_${body}`;
    }

    useEffect(() => {

        const strings = courseSearchString.split(',').map(string => string.trimEnd());
        //Filter out dupes
        let courseCodes = strings.filter((value, index, array) => array.indexOf(value) === index);
        if (onlySearchBlueprints) courseCodes = courseCodes.map(bpify)
        setSeekCourseCodes(courseCodes)
    }, [courseSearchString]);

    useEffectAsync(async () => {
    }, [seekCourseCodes])


    //Handlers
    function updateCourseSearchString() {
        let query = courseSearchString;
        let replaceString = query.replaceAll(/(\w+)\t(\d+)\s*/gs, '$1$2,')
        replaceString = replaceString.replaceAll(/(\w+\d+,)\1+/gs, '$1')

        setCourseSearchString(replaceString.replace(/,$/, ''))

    }

    function getResultsForCourse(course: Course) {
        return testResults.filter(result => result.courseId === course.id)
    }

    const search: FormEventHandler = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isSearching) return;
        updateCourseSearchString();

        const accountIds = [(await Account.getRootAccount()).id];
        setIsSearching(true)
        let courses: typeof foundCourses = [];
        for (let code of seekCourseCodes) {
            if (courseCache[code]) {
                courses = [...courses, ...optionize(courseCache[code])];
            } else {
                const generator = getCourseGenerator(code, accountIds);

                for await (let course of generator) {
                    const [optionCourse] = optionize(
                        [course],
                        course => course.id,
                        course => course.courseCode ?? course.name ?? course.id.toString()
                    );
                    courses = [...courses, optionCourse].toSorted((a, b) => a.baseCode?.localeCompare(b.baseCode));
                    if (onlySearchBlueprints) courses = courses.filter(course => course.isBlueprint())
                    setFoundCourses(courses);
                }
            }
        }
        setIsSearching(false);
    }

    async function runTests(e: React.FormEvent) {
        e.stopPropagation();
        e.preventDefault();
        if (isTesting) return false;
        setIsTesting(true);
        let allTestResults: typeof testResults = [];
        const batches = batchify(coursesToRunOn, 5);

        for (let batch of batches) {
            for (let test of testsToRun) {
                const testResults = await Promise.all(batch.map(async (course) => {
                    const result = await test.run(course);
                    return {
                        ...result,
                        courseId: course.id,
                        test,
                    }
                }));
                allTestResults = [...allTestResults, ...testResults].toSorted((a, b) => {
                    return a.test.name.localeCompare(b.test.name);
                })
                setTestResults(allTestResults);
            }
        }
        setIsTesting(false);
    }


    function ResultsDisplay() {
        return <Row>
            {coursesToRunOn.map(course =>
                <ValidationResultsForCourse
                    key={course.id}
                    results={getResultsForCourse(course)}
                    course={course}/>
            )}
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
                <Row key={course.id}><Col>{course.label ?? course.courseCode ?? course.name}</Col><Col>
                    <button
                        onClick={() => setCoursesToRunOn([...coursesToRunOn, course])}>{'ADD'}</button>
                </Col></Row>
            )
            }
        </>

    }

    return <>
        <button disabled={seekCourseCodes.length === 0} onClick={() => setIsOpen(true)}>Admin</button>
        <Modal isOpen={isOpen} requestClose={() => setIsOpen(false)}>
            <Container>
                <Row>
                    <Col sm={9}>
                        <Row>
                            <Col><SearchCourses
                                search={search}
                                courseSearchString={courseSearchString}
                                setCourseSearchString={setCourseSearchString}
                                setOnlySearchBlueprints={setOnlySearchBlueprints}
                                onlySearchBlueprints={onlySearchBlueprints}
                            /></Col>
                            <Col><SelectValidations
                                runTests={runTests}
                                options={allValidations}
                                testsToRun={testsToRun}
                                setCoursesToRunOn={setCoursesToRunOn}
                                setTestsToRun={setTestsToRun}/></Col>
                        </Row>

                        <ResultsDisplay/>
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
    results: IIncludesTestAndCourseId[],
    course: Course,
}


interface SearchCoursesProps {
    search: FormEventHandler,
    onlySearchBlueprints: boolean,
    setOnlySearchBlueprints: (value: boolean) => void,
    setCourseSearchString: (value: string) => void,
    courseSearchString: string,
}

//render
function SearchCourses({
                           search,
                           setOnlySearchBlueprints,
                           onlySearchBlueprints,
                           courseSearchString,
                           setCourseSearchString
                       }: SearchCoursesProps) {
    return <Form onSubmit={search}>
        <Form.Check
            checked={onlySearchBlueprints}
            type={"switch"}
            label='Only Search Blueprints'
            onChange={(e) => setOnlySearchBlueprints(e.target.checked)}
        ></Form.Check>
        <input type={'text'} value={courseSearchString}
               onChange={(e) => setCourseSearchString(e.target.value)}></input>
        <button>Get Courses</button>
    </Form>
}


interface SelectValidationsProps {
    runTests: FormEventHandler,
    options: (CourseValidationTest & IMultiSelectOption)[],
    setCoursesToRunOn: (courses: (Course & IMultiSelectOption)[]) => void,
    testsToRun: (CourseValidationTest & IMultiSelectOption)[],
    setTestsToRun: (tests: (CourseValidationTest & IMultiSelectOption)[]) => void,
}

function SelectValidations({runTests, options, testsToRun, setTestsToRun, setCoursesToRunOn}: SelectValidationsProps) {
    return <>
        <Form onSubmit={runTests}>
            <MultiSelect
                options={options}
                selectedOptions={testsToRun}
                onSelectionChange={setTestsToRun}></MultiSelect>
            <button onClick={runTests}>Run Tests</button>
        </Form>
        <button
            onClick={() => setCoursesToRunOn([])}
        >Clear
        </button>
    </>

}


function ValidationResultsForCourse({course, results}: IValidationResultsForCourseProps) {
    return <Container>
        <Row><Col><h3>{course.courseCode ?? course.name}</h3></Col></Row>
        {results.map(result => <ValidationRow
            key={result.test.name + course.id}
            course={course}
            test={result.test}
            refreshCourse={async () => undefined}
        />)}

    </Container>
}