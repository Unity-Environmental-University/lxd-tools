import "./publish.scss"
import React, {useEffect, useState} from 'react';
import {Button} from 'react-bootstrap'
import {Course, Page} from "../canvas";
import assert from "assert";
import Modal from "../ui/widgets/Modal"
import {IAssignmentGroup, IModuleData, IUserData} from "../canvas/canvasDataDefs";
import {IProfile, getPotentialFacultyProfiles, getCurioPageFrontPageProfile} from "../canvas/profile";

console.log("running")

function useEffectAsync(func: () => Promise<any>, deps: React.DependencyList) {
    useEffect(() => {
        func().then();
    }, deps)
}

function courseNameSort(a: Course, b: Course) {
    if (a.name < b.name) return -1;
    if (b.name < a.name) return 1;
    return 0;

}

function PublishApp() {
    const [course, setCourse] = useState<Course | null>()
    const [show, setShow] = useState<boolean>(false)
    const [info, setInfo] = useState<string | null | boolean>(null);
    const [getAssociatedCourses, setAssociatedCourses] = useState<Course[]>([])
    const [isBlueprint, setIsBlueprint] = useState<boolean>(false);
    const [workingSection, setWorkingSection] = useState<Course | null>(null);
    const [sectionProfiles, setSectionProfiles] = useState<Record<number, IProfile[]>>({})

    let facultyCourseCached: Course | null = null;


    async function getCourse() {
        if (!course) {
            const tempCourse = await Course.getFromUrl();
            if (tempCourse) {
                const fullCourses: Course[] = [];

                const associatedCourses = await tempCourse.getAssociatedCourses() ?? [];

                for (let course of associatedCourses) {
                    console.log(course.name);
                    const section = await Course.getCourseById(course.id);
                    fullCourses.push(section);
                    fullCourses.sort(courseNameSort);
                    setAssociatedCourses([...fullCourses]);
                }

                setCourse(tempCourse)
                setIsBlueprint(tempCourse?.isBlueprint)
            }
        }
    }

    useEffectAsync(getCourse, [course]);

    function getSectionProfile(section: Course) {
        const tempProfileCache = {...sectionProfiles};
        if (!tempProfileCache[section.id]) {
            section.getPotentialInstructorProfiles().then(profiles => {
                tempProfileCache[section.id] = profiles;
                setSectionProfiles({...tempProfileCache});
            });
        }
        return sectionProfiles[section.id];
    }

    async function publishCourses(event: React.MouseEvent) {
        const accountId = course?.getItem<number>('account_id');
        assert(accountId);
        await Course.publishAll(getAssociatedCourses, accountId)
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
        for (let course of getAssociatedCourses) {
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
            {getAssociatedCourses && getAssociatedCourses.map((course) => (
                <PublishCourseRow
                    facultyProfileMatches={sectionProfiles[course.id]}
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
                    facultyProfileMatches={workingSection && getSectionProfile(workingSection)}
                    onClose={() => setWorkingSection(null)}
                    section={workingSection}
                ></SectionDetails>
            </div>

        </Modal>
    </>)
}


type CourseRowProps = {
    course: Course,
    facultyProfileMatches: IProfile[],
    onClickDx?: (course: Course) => void,
}


function PublishCourseRow({course, onClickDx}: CourseRowProps) {
    const [instructors, setInstructors] = useState<IUserData[]>([])

    useEffect(() => {
        async function getCourse() {
            course.getInstructors().then((instructors) => instructors && setInstructors(instructors));
        }

        getCourse().then();
    }, [course])

    return (<div className={'row course-row'}>
        <div className={'col-xs-6'}>
            <a href={`/courses/${course.id}`} className={course?.workflowState}
               target={"blank_"}>{course.getItem<string>('course_code')}</a>

        </div>
        <div className={'col-xs-2'}>
        </div>
        <div className={'col-xs-1'}>{(onClickDx && course) && (
            <button onClick={() => onClickDx(course)}>Details</button>)}</div>
        <div className={'col-xs-3'}>{instructors.map((instructor) => instructor.name).join(', ')}</div>
    </div>)
}


type SectionDetailsProps = {
    section: Course | null,
    facultyProfileMatches: IProfile[] | null,
    onClose?: () => void,
}


function SectionDetails({section, onClose, facultyProfileMatches}: SectionDetailsProps) {
    const [modules, setModules] = useState<IModuleData[]>([])
    const [assignmentGroups, setAssignmentGroups] = useState<IAssignmentGroup[]>([])
    const [instructors, setInstructors] = useState<IUserData[]>([])
    const [frontPageProfile, setFrontPageProfile] = useState<IProfile | null>(null)


    useEffectAsync(async () => {
        await onSectionChange();
    }, [section]);


    async function onSectionChange() {
        /* clear out values so we don't end up rendering last window's data */
        setInstructors([]);
        setModules([]);
        setAssignmentGroups([]);
        setFrontPageProfile(null);
        if (!section) return;

        await Promise.all([
            async () => setFrontPageProfile(await section.getFrontPageProfile()),
            async () => setModules(await section.getModules()),
            async () => setInstructors(await getInstructors(section) ?? []),
            async () => setAssignmentGroups(await section.getAssignmentGroups({
                queryParams: {
                    include: ['assignments']
                }
            }))
        ].map(func => func()))

    }

    async function getInstructors(section: Course) {
        const fetchInstructors = await section.getInstructors();
        fetchInstructors && setInstructors(fetchInstructors)
        return fetchInstructors;
    }


    return (section && (<div>
        <h3>{section.name}
            <button onClick={onClose}>X</button>
        </h3>
        <p>{instructors.map(instructor => instructor.name).join(',')}</p>
        <div className={'row'}>
            <div className={'col-sm-8'}>
                {facultyProfileMatches && facultyProfileMatches.map((profile, i) => (
                    <div key={i} className={'row'} style={{border: "1px solid black", boxShadow: "10 10 2 #888"}}>
                        <div className={'col-xs-3'}>
                            <h4>Image</h4>
                            {profile.imageLink ? <img style={{width: '100px'}} src={profile.imageLink}></img> :
                                <h3>No Image</h3>}
                            <h4>Display Name</h4>
                            <p>{profile.displayName ?? "[No Display Name Found]"}</p>
                        </div>
                        <div className={'col-xs-9 rawHtml'}>
                            {profile.body ?? "[No bio found on page]"}
                        </div>
                        <div className={'col-xs-12'}>
                            <Button disabled={true}>Use this for profile</Button>
                        </div>

                    </div>))}

            </div>
            <div className={'col-sm-4'}>
                <div className={'col'}>
                    <h4>Modules</h4>
                    {modules.map((module) => (<div key={module.id} className={'row'}>
                        <div className={'col-xs-12'}>{module.name}</div>
                    </div>))}
                </div>
                <div className={'col'}>
                    <h4>Assignment Groups</h4>
                    {assignmentGroups.map((group) => (
                        <div key={group.id} className={'row'}>
                            <div className={'col-xs-9'}>{group.name}</div>
                            <div className={'col-xs-3'}>{group.group_weight}%</div>
                            <ul>
                                {group.assignments?.map((assignment) => (
                                    <li>{assignment.name}</li>
                                ))}
                            </ul>

                        </div>
                    ))}
                </div>

            </div>
        </div>
    </div>))
}

export default PublishApp

