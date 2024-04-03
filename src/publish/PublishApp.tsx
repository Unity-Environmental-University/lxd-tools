import "./publish.scss"
import React, {useEffect, useState} from 'react';
import {Button} from 'react-bootstrap'
import {Course, Page} from "../canvas";
import assert from "assert";
import Modal from "../ui/widgets/Modal"
import {IAssignmentGroup, IModuleData, IUserData} from "../canvas/canvasDataDefs";

console.log("running")

function useEffectAsync(func:() => Promise<any>, deps: React.DependencyList) {
    useEffect(() => {
        console.log('useeffect');
        func().then();
    }, deps)
}

function PublishApp() {
    const [course, setCourse] = useState<Course | null>()
    const [show, setShow] = useState<boolean>(false)
    const [info, setInfo] = useState<string | null | boolean>(null);
    const [associatedCourses, setAssociatedCourses] = useState<Course[]>([])
    const [isBlueprint, setIsBlueprint] = useState<boolean>(false);
    const [workingSection, setWorkingSection] = useState<Course | null>(null);


   async function getCourse() {
        if (!course) {
            const tempCourse = await Course.getFromUrl();
            if (tempCourse) {
                const fullCourses: Course[] = [];

                const associatedCourses = await tempCourse.getAssociatedCourses() ?? [];
                const promiseList = associatedCourses.map((course) => {
                    return (async () => {
                        console.log(course.name);
                        fullCourses.push(await Course.getCourseById(course.id));
                        setAssociatedCourses([...fullCourses]);
                    })();
                })
                await Promise.all(promiseList);

                setCourse(tempCourse)
                setIsBlueprint(tempCourse?.isBlueprint)
            }
        }
    }
    useEffectAsync(getCourse, [course]);


    async function publishCourses(event: React.MouseEvent) {
        const accountId = course?.getItem<number>('account_id');
        assert(accountId);
        await Course.publishAll(associatedCourses, accountId)
        window.setTimeout(async () => {
            let newAssocCourses = await course?.getAssociatedCourses();
            if (newAssocCourses) {
                newAssocCourses = [...newAssocCourses];
            } else {
                newAssocCourses = [];
            }
            setAssociatedCourses(newAssocCourses);
            setInfo('Finished Publishing');
        }, 500);
    }

    function openButton() {
        return (course && <Button disabled={!isBlueprint}
                                  className="ui-button"
                                  onClick={(e) => setShow(true)}
        >{isBlueprint ? "Publish Sections.." : "Not A Blueprint"}</Button>)
    }

    function openAll(e: React.MouseEvent) {
        e.stopPropagation();
        for (let course of associatedCourses) {
            window.open(course.courseUrl, "_blank");
        }

    }

    function associatedCourseRows() {
        return (<div className={'course-table'}>
            <div className={'row'}>
                <div className={'col-sm-9'}>

                    <div><strong>Code</strong></div>
                    <a href={'#'} onClick={openAll}>Open All</a>
                </div>
                <div className={'col-sm-3'}><strong>Instructor(s)</strong></div>
            </div>
            {associatedCourses && associatedCourses.map((course) => (
                <PublishCourseRow
                    key={course.id}
                    onClickDx={(section) => setWorkingSection(section)}
                    course={course}/>))}
        </div>)
    }


    return (<>
        {openButton()}
        <Modal id={'lxd-publish-interface'} isOpen={show} requestClose={() => setShow(false)}>
            {!workingSection && (<div>
                <div className='row'>
                    <div className={'col-xs-12'}>
                        <h3>Publish Sections</h3>
                    </div>
                    <div className={'col-xs-12 col-sm-8'}>
                        Publish sections associated with this blueprint
                    </div>
                    <div className='col-xs-12'>
                        {associatedCourseRows()}
                    </div>
                    <div className={'col-xs-12 button-container'}>
                        <Button className="btn" disabled={!(course?.isBlueprint)} onClick={publishCourses}>
                            Publish Sections
                        </Button>

                    </div>
                </div>
            </div>)}
            {info && <div className={'alert alert-primary'}>{info}</div>}
            <div>
                <SectionDetails
                    onClose={() => setWorkingSection(null)}
                    section={workingSection}
                ></SectionDetails>
            </div>

        </Modal>
    </>)
}


type CourseRowProps = {
    course: Course,
    onClickDx?: (course: Course) => void,
}

function PublishCourseRow({course, onClickDx}: CourseRowProps) {
    const [instructors, setInstructors] = useState<IUserData[]>([])

    useEffect(() => {
        async function getCourse() {
            course.getInstructors().then((instructors) => instructors && setInstructors(instructors));
            console.log(course);
        }

        getCourse().then();
    }, [course])

    return (<div className={'row course-row'}>
        <div className={'col-xs-7'}>
            <a href={`/courses/${course.id}`} className={course?.workflowState}
               target={"blank_"}>{course.getItem<string>('course_code')}</a>

        </div>
        <div className={'col-xs-2'}>{(onClickDx && course) && (
            <button onClick={() => onClickDx(course)}>Details</button>)}</div>
        <div className={'col-xs-3'}>{instructors.map((instructor) => instructor.name).join(', ')}</div>
    </div>)
}


type SectionDetailsProps = {
    section: Course | null,
    onClose?: () => void,
}


function SectionDetails({section, onClose}: SectionDetailsProps) {
    const [modules, setModules] = useState<IModuleData[]>([])
    const [assignmentGroups, setAssignmentGroups] = useState<IAssignmentGroup[]>([])
    const [instructors, setInstructors] = useState<IUserData[]>([])
    const [frontPageBio, setFrontPageBio] = useState<string | null>(null)
    const [facultyBioPageMatches, setFacultyBioPageMatches] = useState<Page[]>([])

    let facultyCourseCached: Course | null = null;

    useEffect(() => {
        onSectionChange().then();

    }, [section]);


    async function onSectionChange() {
        if (!section) {
            setModules([]);
            setAssignmentGroups([]);
            return;
        }
        setModules(await section.getModules())
        setAssignmentGroups(await section.getAssignmentGroups({
            queryParams: {
                include: ['assignments']
            }
        }))

        const instructors = await getInstructors(section) ?? [];
        await getFacultyBioPageMatches(instructors, section);


    }

    async function getInstructors(section: Course) {
        const fetchInstructors = await section.getInstructors();
        fetchInstructors && setInstructors(fetchInstructors)
        return fetchInstructors;
    }

    async function getFacultyPages(facultyCourse: Course, searchTerm: string) {
        return await facultyCourse.getPages({
            queryParams: {
                search_term: searchTerm
            }
        })
    }
    async function getFacultyBioPageMatches(instructors: IUserData[], section: Course) {
        const facultyCourse = facultyCourseCached ?? await Course.getByCode('Faculty Bios');
        facultyCourseCached = facultyCourse;
        if (facultyCourse) {
            console.log(instructors.map(instructor => instructor.name).join(' '))
            let matches: Page[] = [];

            for (let instructor of instructors) {
                let instructorPages = await getFacultyPages(facultyCourse, instructor.name);
                for(let searchTerm of [
                    instructor.name,
                    instructor.last_name,
                    instructor.first_name
                ]) {
                    instructorPages = await getFacultyPages(facultyCourse, searchTerm);
                    if(instructorPages.length > 0) break;
                }
                matches = [...matches, ...instructorPages]
            }

            setFacultyBioPageMatches(matches)
        }
    }

    return (section && (<div>
        <h3>{section.name}
            <button onClick={onClose}>X</button>
        </h3>
        <p>{instructors.map(instructor => instructor.name).join(',')}</p>
        <div className={'row'}>
            <div className={'col-sm-8'}>
                {facultyBioPageMatches.map((pageMatch) => (<div key={pageMatch.id} className={'row'}>
                    <div className={'col-xs-6'}>
                        {pageMatch.name}
                    </div>
                    <div className={'col-xs-6'}>
                        <a href={`/${pageMatch.contentUrlPath}`}>Faculty Page Link</a>
                    </div>
                </div>))}
            </div>
            <div className={'col-sm-4'}>
                <h4>Modules</h4>
                {modules.map((module) => (<div key={module.id} className={'row'}>
                    <div className={'col-xs-12'}>{module.name}</div>
                </div>))}
            </div>

        </div>
    </div>))
}

export default PublishApp

