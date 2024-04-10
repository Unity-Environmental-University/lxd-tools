import "./publish.scss"
import React, {useState} from 'react';
import {Button} from 'react-bootstrap'
import {Course} from "../canvas";
import assert from "assert";
import Modal from "../ui/widgets/Modal"
import {IProfile, renderProfileIntoCurioFrontPage} from "../canvas/profile";
import {useEffectAsync} from "../ui/utils";
import {SectionDetails} from "./SectionDetails";
import {PublishCourseRow} from "./PublishCourseRow";
import {courseNameSort} from "../canvas/utils";
console.log("running")

function PublishApp() {
    //-----
    // DATA
    //-----
    const [course, setCourse] = useState<Course | null>()
    const [show, setShow] = useState<boolean>(false)
    const [info, setInfo] = useState<string | null | boolean>(null);
    const [associatedCourses, setAssociatedCourses] = useState<Course[]>([])
    const [isBlueprint, setIsBlueprint] = useState<boolean>(false);
    const [workingSection, setWorkingSection] = useState<Course | null>(null);
    const [sectionProfiles, setSectionProfiles] = useState<Record<number, IProfile[]>>({})
    const [publishErrors, setPublishErrors] = useState<Record<number, string[]>>({})
    const [loading, setLoading] = useState<boolean>(false);
    const [infoClass, setInfoClass] = useState<string>('alert-secondary')

    async function getCourse() {
        if (!course) {
            const tempCourse = await Course.getFromUrl();
            if (tempCourse) {

                setCourse(tempCourse)
                setIsBlueprint(tempCourse?.isBlueprint)
                await getFullCourses(tempCourse)
            }
        }
    }

    useEffectAsync(getCourse, [course]);

    async function getFullCourses(course: Course) {
        const fullCourses: Course[] = [];
        const associatedCourses = await course.getAssociatedCourses() ?? [];
        let promises = [];
        for (let course of associatedCourses) {
            promises.push(async () => {
                console.log(course.name);
                const section = await Course.getCourseById(course.id);
                fullCourses.push(section);
                fullCourses.sort(courseNameSort);
                setAssociatedCourses([...fullCourses]);
            })
        }
        await Promise.all(promises.map((func) => func()))
    }

    async function getSectionProfileAsync(section: Course) {
        const tempProfileCache = {...sectionProfiles};
        if (!tempProfileCache[section.id]) {
           const profiles = await section.getPotentialInstructorProfiles();
           tempProfileCache[section.id] = profiles;
           setSectionProfiles({...tempProfileCache});
        };
        return tempProfileCache[section.id];
    }

    //ONLY use in Render -- may return nothing initially, then render pass updates it
    function getSectionProfileInRender(section: Course) {
        getSectionProfileAsync(section).then();
        return sectionProfiles[section.id];
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

    function sectionError(section:Course, error: string) {
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
        for(let section of associatedCourses) {
            const profiles = await getSectionProfileAsync(section);
            const errors = [];
            if (profiles.length < 1) {
                sectionError(section, "No Profiles")
                continue;
            }
            if(profiles.length > 1) {
                errors.push("Multiple Matches Found")
            }
            const profile = profiles[0];
            const frontPage = await section.getFrontPage();
            if(!frontPage) {
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

    function inform(message: string, alertClass:string='alert-secondary') {
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

    return (<>
        {openButton()}
        <Modal id={'lxd-publish-interface'} isOpen={show} canClose={!loading} requestClose={() => {
            if(!loading) setShow(false);
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
                        <Button className="btn" disabled={loading || !(course?.isBlueprint)} onClick={applySectionProfiles}>
                            Set Bios
                        </Button>
                        <Button className="btn" disabled={loading || !(course?.isBlueprint)} onClick={publishCourses}>
                            Publish
                        </Button>

                    </div>
                    <div className='col-xs-12'>
                        {associatedCourseRows()}
                    </div>
                </div>
            </div>)}
            {info && <div className={`alert ${infoClass}`} role={'alert'}>{info}</div>}
            <div>
                <SectionDetails
                    facultyProfileMatches={workingSection && getSectionProfileInRender(workingSection)}
                    onClose={() => setWorkingSection(null)}
                    section={workingSection}
                ></SectionDetails>
            </div>

        </Modal>
    </>)
}


export default PublishApp

