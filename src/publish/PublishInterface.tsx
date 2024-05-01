import {Course} from "../canvas/index";
import React, {useState} from "react";
import {IProfile, renderProfileIntoCurioFrontPage} from "../canvas/profile";
import {useEffectAsync} from "../ui/utils";
import {courseNameSort} from "../canvas/canvasUtils";
import assert from "assert";
import {Button} from "react-bootstrap";
import {PublishCourseRow} from "./PublishCourseRow";
import Modal from "../ui/widgets/Modal/index";
import {SectionDetails} from "./SectionDetails";
import {callAll} from "../canvas/canvasUtils";

type PublishInterfaceProps = {
    course: Course | null,
}

export function PublishInterface({course}: PublishInterfaceProps) {
    //-----
    // DATA
    //-----
    const [show, setShow] = useState<boolean>(false)
    const [info, setInfo] = useState<string | null | boolean>(null);
    const [associatedCourses, setAssociatedCourses] = useState<Course[]>([])
    const [isBlueprint, setIsBlueprint] = useState<boolean>(false);
    const [workingSection, setWorkingSection] = useState<Course | null>(null);
    const [sectionProfiles, setSectionProfiles] = useState<Record<number, IProfile[]>>({})
    const [publishErrors, setPublishErrors] = useState<Record<number, string[]>>({})
    const [loading, setLoading] = useState<boolean>(false);
    const [infoClass, setInfoClass] = useState<string>('alert-secondary')
    const [emails, setEmails] = useState<string[]>([])
    async function updateCourse() {
        if (course) {
            setIsBlueprint(course.isBlueprint)
            await getFullCourses(course);
        }
    }

    useEffectAsync(updateCourse, [course]);
    useEffectAsync(async () => {
        const profileSet: Record<number, IProfile[]> = [];
        for(let course of associatedCourses) {
            profileSet[course.id] = await course.getPotentialInstructorProfiles();
        }
        setSectionProfiles(profileSet)
    }, [associatedCourses])

    async function getFullCourses(course: Course) {
        const fullCourses: Course[] = [];
        const associatedCourses = await course.getAssociatedCourses() ?? [];
        console.log(associatedCourses);
        let getSectionFuncs = [];
        const instructorEmails:Set<string> = new Set();
        for (let course of associatedCourses) {
            getSectionFuncs.push(async () => {
                const section = await Course.getCourseById(course.id);
                const instructors = await section.getInstructors();
                if(instructors) {
                    for (let instructor of instructors) {
                        instructorEmails.add(instructor.email);
                    }
                }
                fullCourses.push(section);
                fullCourses.sort(courseNameSort);
                console.log(courseNameSort);
                setAssociatedCourses([...fullCourses]);
                setEmails([...instructorEmails])
            })
        }

        callAll(getSectionFuncs);
    }

    //-----
    // EVENTS
    //-----
    async function publishCourses(event: React.MouseEvent) {
        const accountId = course?.getItem<number>('account_id');
        assert(accountId);
        await Course.publishAll(associatedCourses, accountId)
        inform('publishing')
        setLoading(true);
        //Waits half a second to allow changes to propagate on the server
        window.setTimeout(async () => {
            let newAssocCourses = await course?.getAssociatedCourses();
            if (newAssocCourses) {
                newAssocCourses = [...newAssocCourses];
            } else {
                newAssocCourses = [];
            }
            setAssociatedCourses(newAssocCourses);
            setLoading(false);
            success('Published');
        }, 500);
    }

    function openAll(e: React.MouseEvent) {
        e.stopPropagation();
        for (let course of associatedCourses) {
            window.open(course.courseUrl, "_blank");
        }
    }

    function sectionError(section: Course, error: string) {
        let tempErrors = {...publishErrors}
        let errorSet = tempErrors[section.id] ?? [];
        errorSet.push(error);
        tempErrors[section.id] = errorSet
        setPublishErrors({...tempErrors})
    }

    async function applySectionProfiles(event: React.MouseEvent) {
        setLoading(true);
        inform("Updating section profiles...")
        setPublishErrors({});
        for (let section of associatedCourses) {
            const profiles = sectionProfiles[section.id];
            const errors = [];
            if (profiles.length < 1) {
                sectionError(section, "No Profiles")
                continue;
            }
            if (profiles.length > 1) {
                errors.push("Multiple Matches Found")
            }
            const profile = profiles[0];
            const frontPage = await section.getFrontPage();
            if (!frontPage) {
                sectionError(section, "No front page")
                continue;
            }
            const html = renderProfileIntoCurioFrontPage(frontPage.body, profile);
            await frontPage.updateContent(html);
            setInfo(`Updated ${profile.displayName}...`)
        }
        setLoading(false);
        success("Profiles Updated")
    }

    function inform(message: string, alertClass: string = 'alert-secondary') {
        setInfo(message);
        setInfoClass(alertClass)
    }

    function success(message: string) {
        inform(message, 'alert-success');
    }


    //-----
    // RENDER
    //-----
    function openButton() {
        return (course && <Button disabled={!isBlueprint}
                                  className={isBlueprint ? 'ui-button' : ''}
                                  onClick={(e) => setShow(true)}
        >{isBlueprint ? "Manage Sections" : "Not A Blueprint"}</Button>)
    }

    function associatedCourseRows() {
        return (<div className={'course-table'}>
            <div className={'row'}>
                <div className={'col-sm-6'}>

                    <div><strong>Code</strong></div>
                    <a href={'#'} onClick={openAll}>Open All</a>
                </div>
                <div className={'col-sm-3'}><strong>Name on Front Page</strong></div>
                <div className={'col-sm-3'}><strong>Instructor(s)</strong></div>
            </div>
            {associatedCourses && associatedCourses.map((course) => (
                <PublishCourseRow
                    facultyProfileMatches={sectionProfiles[course.id]}
                    key={course.id}
                    errors={publishErrors[course.id]}
                    onClickDx={(section) => setWorkingSection(section)}
                    course={course}/>))}
        </div>)
    }


    /**
     * Parses the profile sets in to a list of emails, omitting when the profile does not have a user property.
     * @param profileSets
     */

    return (<>
        {openButton()}
        <Modal id={'lxd-publish-interface'} isOpen={show} canClose={!loading} requestClose={() => {
            if (!loading) setShow(false);
        }}>
            {!workingSection && (<div>
                <div className='row'>

                    <div className={'col-xs-12'}>
                        <h3>Sections</h3>
                    </div>
                    <div className={'col-xs-12 col-sm-12'}>
                        Publish sections associated with this blueprint
                    </div>
                    <div className={'col-xs-2'}>
                        <Button className="btn" disabled={loading || !(course?.isBlueprint)}
                                onClick={applySectionProfiles}>
                            Set Bios
                        </Button>
                        <Button className="btn" disabled={loading || !(course?.isBlueprint)} onClick={publishCourses}>
                            Publish
                        </Button>

                    </div>
                    <div className={'col-xs-12'}>
                        <p>{emails.join(', ')}</p>
                    </div>
                    <div className='col-xs-12'>
                        {associatedCourseRows()}
                    </div>
                </div>
            </div>)}
            {info && <div className={`alert ${infoClass}`} role={'alert'}>{info}</div>}
            <div>
            </div>
            <div>
                <SectionDetails
                    facultyProfileMatches={workingSection && sectionProfiles[workingSection.id]}
                    onClose={() => setWorkingSection(null)}
                    section={workingSection}
                ></SectionDetails>
            </div>

        </Modal>
    </>)
}