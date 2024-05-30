import {Course, getCourseGenerator,} from "../canvas/course/index";
import React, {FormEvent, FormEventHandler, useEffect, useReducer, useState} from "react";
import {
    badContentRunFunc,
    CourseValidation,
    ValidationTestResult
} from "../publish/fixesAndUpdates/validations/index";
import courseContent from "../publish/fixesAndUpdates/validations/courseContent";
import courseSettings from "../publish/fixesAndUpdates/validations/courseSettings";
import syllabusTests from "../publish/fixesAndUpdates/validations/syllabusTests";
import MultiSelect, {IMultiSelectOption, optionize, optionizeOne} from "../ui/widgets/MuliSelect";
import Modal from "../ui/widgets/Modal/index";
import {Col, Container, Form, Row} from "react-bootstrap";
import {batchify, filterUniqueFunc} from "../canvas/canvasUtils";
import {ValidationRow} from "../publish/fixesAndUpdates/ValidationRow";
import {Account} from "../canvas/index";
import {collectionLutDispatcher, lutDispatcher} from "../reducerDispatchers";


interface IAdminAppProps {
    course?: Course,
}

const tests: CourseValidation[] = [
    ...courseContent,
    ...courseSettings,
    ...syllabusTests,
]

function getTestName(test: CourseValidation) {
    return test.name;
}

interface IIncludesTestAndCourseId extends ValidationTestResult {
    test: CourseValidation,
    courseId: number,
}


export function AdminApp({course}: IAdminAppProps) {
    const [isOpen, setIsOpen] = useState(false);

    const [foundCourses, setFoundCourses] = useState<(Course & IMultiSelectOption)[]>([]);
    const [coursesToRunOn, setCoursesToRunOn] = useState<(Course & IMultiSelectOption)[]>([])

    const [validationsToRun, setValidationsToRun] = useState<(CourseValidation & IMultiSelectOption)[]>([])
    const [validationResults, setValidationResults] = useState<IIncludesTestAndCourseId[]>([])

    const [onlySearchBlueprints, setOnlySearchBlueprints] = useState(true);

    const [
        validationResultsLut,
        dispatchValidationResultsLut
    ] = useReducer(collectionLutDispatcher<IIncludesTestAndCourseId>, {});

    const [includeDev, setIncludeDev] = useState(false);
    const [includeSections, setIncludeSections] = useState(false);

    const [isValidating, setIsValidating] = useState(false);

    const [
        parentCourseLut
        , dispatchParentCourseLut
    ] = useReducer(lutDispatcher<number, Course | null>, {});
    const [sectionLut, dispatchSectionLut] = useReducer(collectionLutDispatcher<Course>, {})


    function cacheAssociatedCourses(bpId: number, toAdd: Course[] | Course) {
        const sections = Array.isArray(toAdd) ? toAdd : [toAdd];
        console.log(bpId, sections.map(a => a.courseCode))
        dispatchSectionLut({add: {key: bpId, items: sections}});
    }

    function cacheParentCourse(bpId: number, toAdd: Course | null) {
        dispatchParentCourseLut({set: {key: bpId, item: toAdd}})
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


    async function runTests(e: React.FormEvent) {
        e.stopPropagation();
        e.preventDefault();
        if (isValidating) return false;
        setIsValidating(true);
        let allTestResults: typeof validationResults = [];
        let coursesToValidate: typeof coursesToRunOn = [];


        for (let course of coursesToRunOn) {
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

        for (let batch of batchify(coursesToValidate, 5)) {

            for (let test of validationsToRun) {
                console.log('running', test.name);
                let testResults = await Promise.all(batch.map((course) => getTestResultOption(course, test)));

                for (let result of testResults) {
                    dispatchValidationResultsLut({
                        add: {key: result.courseId, items: [result]}
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
            {coursesToRunOn.map(course => <ResultsDisplayRow
                course={course}
                key={course.id}
                parentCourse={parentCourseLut[course.id]}
                sections={sectionLut[course.id]}
            />)}
        </Row>
    }

    interface IResultsDisplayRowProps {
        course: Course,
        parentCourse?: Course | null,
        sections?: Course[] | null
    }

    function ResultsDisplayRow({course, parentCourse, sections}: IResultsDisplayRowProps) {
        return <>
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


        </>
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
                            {onlySearchBlueprints && <Col sm={4}>
                                <Form.Label>Include Dev</Form.Label>
                                <Form.Check checked={includeDev} onChange={(e) => setIncludeDev(e.target.checked)}/>
                            </Col>}
                            {onlySearchBlueprints && <Col sm={4}>
                                <Form.Label>Include Sections</Form.Label>
                                <Form.Check checked={includeSections} onChange={(e) => setIncludeSections(e.target.checked)}/>
                            </Col>}
                        </Row>
                        <Row>
                            <Col>
                                <SearchCourses
                                    setFoundCourses={setFoundCourses}
                                    onlySearchBlueprints={onlySearchBlueprints}
                                    setIsSearching={() => null}
                                />
                            </Col><Col>
                            <SelectValidations
                                runTests={runTests}
                                testsToRun={validationsToRun}
                                setCoursesToRunOn={(courses) => optionize(courses)}
                                onChangeCustomValidation={()=>null}
                                setTestsToRun={setValidationsToRun}/>
                        </Col>
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
    results?: IIncludesTestAndCourseId[],
    slim?: boolean,
    course
        :
        Course,
}


interface ISearchCoursesProps {
    onlySearchBlueprints: boolean,
    setIsSearching: (value: boolean) => void,
    setFoundCourses: (value: (Course & IMultiSelectOption)[]) => void,
}

function SearchCourses({
    setFoundCourses,
    onlySearchBlueprints,
}: ISearchCoursesProps) {

    const [courseSearchString, setCourseSearchString] = useState('');
    const [seekCourseCodes, setSeekCourseCodes] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    function updateCourseSearchString() {
        let replaceString = courseSearchString.replaceAll(/(\w+)\t(\d+)\s*/gs, '$1$2,')
        replaceString = replaceString.replaceAll(/(\w+\d+,)\1+/gs, '$1')
        setCourseSearchString(replaceString.replace(/,$/, ''))
    }

    const search: FormEventHandler = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isSearching) return;
        updateCourseSearchString();

        const accountIds = [(await Account.getRootAccount()).id];
        setIsSearching(true)
        let courses: (Course & IMultiSelectOption)[] = [];
        for (let code of seekCourseCodes) {

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
        setIsSearching(false);
    }

    useEffect(() => {

        const strings = courseSearchString.split(',').map(string => string.trimEnd());
        //Filter out dupes
        let courseCodes = strings.filter((value, index, array) => array.indexOf(value) === index);
        if (onlySearchBlueprints) courseCodes = courseCodes.map(bpify)
        setSeekCourseCodes(courseCodes)
    }, [courseSearchString]);


    return <Form onSubmit={search}>
        <input type={'text'} value={courseSearchString}
               onChange={(e) => setCourseSearchString(e.target.value)}></input>
        <button>Get Courses</button>
    </Form>
}


type ValidationOption = CourseValidation & IMultiSelectOption

interface SelectValidationsProps {
    runTests: FormEventHandler
    setCoursesToRunOn: (courses: ValidationOption[]) => void
    testsToRun: ValidationOption[]
    setTestsToRun: (validations: ValidationOption[]) => void
    onChangeCustomValidation: (validation: ValidationOption) => void
}

function SelectValidations({

    runTests, testsToRun, setTestsToRun, setCoursesToRunOn, onChangeCustomValidation
}: SelectValidationsProps) {

    const [allValidations, _] = useState(optionize(tests, getTestName, getTestName))

    return <>
        <Row>
            <Col sm={12}>
                <Form onSubmit={runTests}>
                    <MultiSelect
                        options={allValidations}
                        selectedOptions={testsToRun}
                        onSelectionChange={setTestsToRun}></MultiSelect>
                    <button onClick={runTests}>Run Tests</button>
                </Form>
            </Col>
            <Col sm={12}>
                <CustomSearchValidation onGenerateSearchValidation={validation => {
                    setTestsToRun(optionize([validation]))
                    onChangeCustomValidation(optionizeOne(validation))
                }}/>
            </Col>
            <Col>
                <button
                    onClick={() => setCoursesToRunOn([])}
                >Clear
                </button>
            </Col>
        </Row>
    </>
}

function ValidationResultsForCourse({
    course, results, slim
}: IValidationResultsForCourseProps) {
    return <Container>

        <Row><Col>
            <h3 style={{fontSize: slim ? '0.5em' : '1em'}}>
                <a href={course.htmlContentUrl} target={'_blank'}>{course.courseCode ?? course.name}</a>
            </h3>
        </Col></Row>
        {
            results && results.map(result => <ValidationRow
                key={result.test.name + course.id}
                course={course}
                slim={slim}
                initialResult={result}
                test={result.test}
                potemkinVillage={true}
                refreshCourse={async () => undefined}
            />)
        }
    </Container>
}

interface ICustomSearchValidationParams {
    onGenerateSearchValidation(generatedValidation
        :
        CourseValidation
    ):
        void,
}


function CustomSearchValidation({
    onGenerateSearchValidation
}: ICustomSearchValidationParams) {
    const [queryString, setQueryString] = useState('');
    const [parseRegex, setParseRegex] = useState(true);
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [isValidRegex, setIsValidRegex] = useState(false);


    function validateRegex(pattern: string, flags?: string) {
        try {
            return new RegExp(pattern, flags);
        } catch {
            return false;
        }
    }

    useEffect(() => {
        setIsValidRegex(!!validateRegex(queryString))
    }, [queryString])

    //Events
    function onSubmit(e: FormEvent) {
        e.preventDefault();
        const stringRepresentation = parseRegex ? `/${queryString}/` : queryString;
        const patternToUse = parseRegex ? queryString : escapedQueryStringRegex(queryString);
        const regex = validateRegex(patternToUse, caseSensitive ? 'g' : 'ig');

        if (!regex) {
            console.warn(`${patternToUse} is not a valid regular expression`)
            return;
        }

        onGenerateSearchValidation({
            name: `custom search: ${stringRepresentation}`,
            description: `Course content ${parseRegex ? 'matches pattern' : 'contains text'} ${stringRepresentation}`,
            run: badContentRunFunc(regex),
        })
    }

    return <Form onSubmit={onSubmit}>
        <Row>
            <Col>
                <Form.Label>Search For:</Form.Label>
                <Form.Control type={'text'} value={queryString} onChange={(e) => setQueryString(e.target.value)}/>
            </Col>
        </Row>
        <Row>

        </Row>
        {parseRegex && !isValidRegex && <Row>
            <Col className={'alert alert-danger'}>
                ${queryString} is not a valid regular expression.
            </Col>
        </Row>}
        {parseRegex && <Row><Col>
            <a href={'https://regexone.com/'}>This site</a> has a tutorial on how to use regular expressions.
        </Col></Row>}
    </Form>
}

function escapedQueryStringRegex(query: string) {
    return query.replaceAll(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function bpify(code: string) {
    let [, prefix] = code.match(/^([^_]*)_/) || [null, ''];
    let [, body] = code.match(`${prefix || ''}_?(.*)`) || [null, code];
    return `BP_${body}`;
}
