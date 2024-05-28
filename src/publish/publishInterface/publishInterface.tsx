import React, {useState} from "react";
import {IProfile, renderProfileIntoCurioFrontPage} from "../../canvas/profile";
import {useEffectAsync} from "../../ui/utils";
import assert from "assert";
import {Button} from "react-bootstrap";
import {PublishCourseRow} from "./PublishCourseRow";
import Modal from "../../ui/widgets/Modal/index";
import {SectionDetails} from "./SectionDetails";
import {Course} from "../../canvas/course/index";
import {IUserData} from "../../canvas/canvasDataDefs";
import {Term} from "../../canvas/index";
import {Temporal} from "temporal-polyfill";
import {EmailLink} from "./EmailLink";

type PublishInterfaceProps = {
    course?: Course,
    user: IUserData,
}

export function PublishInterface({course, user}: PublishInterfaceProps) {
    //-----
    // DATA
    //-----
    const [show, setShow] = useState<boolean>(false)
    const [info, setInfo] = useState<string | null | boolean>(null);
    const [associatedCourses, setAssociatedCourses] = useState<Course[]>([])
    const [term, setTerm] = useState<Term | null>();
    const[sectionStart, setSectionStart] = useState<Temporal.PlainDateTime>();
    const [isBlueprint, setIsBlueprint] = useState<boolean>(false);
    const [workingSection, setWorkingSection] = useState<Course|null>();

    const [potentialSectionProfiles, setPotentialSectionProfiles] = useState<Record<number, IProfile[]>>({})
    const [sectionFrontPageProfiles, setSectionFrontPageProfiles] = useState<Record<number, IProfile>>({});
    const [instructorsForCourse, setInstructorsForCourse] = useState<Record<number, IUserData[]>>({});
    const [emails, setEmails] = useState<string[]>([])

    const [publishErrors, setPublishErrors] = useState<Record<number, string[]>>({})
    const [loading, setLoading] = useState<boolean>(false);
    const [infoClass, setInfoClass] = useState<string>('alert-secondary')


    useEffectAsync(updateCourse, [course]);

    async function updateCourse() {
        if (course) {
            setIsBlueprint(course.isBlueprint)
            await getFullCourses(course);
        }
    }

    useEffectAsync(async () => {
        const profileSet: Record<number, IProfile[]> = [];
        for (let course of associatedCourses) {

            profileSet[course.id] ??= await course.getPotentialInstructorProfiles();
        }
        setPotentialSectionProfiles(profileSet)
    }, [associatedCourses])

    async function getFullCourses(course: Course) {
        console.log("Getting Full Courses");
        const sections: Course[] = [];
        const fetchedCourses = await course.getAssociatedCourses() ?? [];
        const frontPageProfiles: typeof sectionFrontPageProfiles = {};
        const allInstructors: typeof instructorsForCourse = {};
        const allEmails = new Set<string>();
        const batchLoadSize = 5;
        let sectionStartSet = false;
        for (let i = 0; i < fetchedCourses.length; i += batchLoadSize) {
            const batch = fetchedCourses.slice(i, i + batchLoadSize);
            const results = await Promise.all(batch.map(course => loadSection(course)));
            let tempTerm: Term | null = null;

            for (let {section, instructors, frontPageProfile} of results) {
                if (!sectionStartSet) {
                    let actualStart = await section.getStartDateFromModules();
                    sectionStartSet = true;
                    setSectionStart(Temporal.PlainDateTime.from(actualStart));
                }

                if(!tempTerm) {
                    tempTerm = await section.getTerm();
                    setTerm(tempTerm);
                }

                sections.push(section);
                setAssociatedCourses([...sections]);

                frontPageProfiles[section.id] = frontPageProfile;
                setSectionFrontPageProfiles({...frontPageProfiles});

                if (instructors) {
                    allInstructors[section.id] = instructors;
                    setInstructorsForCourse({...allInstructors})
                }

                const emails = instructors?.map(a => a.email);
                emails?.forEach(email => allEmails.add(email));
                if (emails) setEmails([...allEmails]);

            }

        }
    }

    async function loadSection(course: Course) {
        const section = await Course.getCourseById(course.id);
        const frontPageProfile = await section.getFrontPageProfile();
        const instructors = await section.getInstructors();
        return {section, instructors, frontPageProfile, emails}
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
        inform("Updating section profiles...");
        const currentProfiles = {...sectionFrontPageProfiles};
        setPublishErrors({});
        for (let section of associatedCourses) {
            const profiles = potentialSectionProfiles[section.id];
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
            currentProfiles[section.id] = profile;
            setSectionFrontPageProfiles({...currentProfiles});
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

    function mailTo(emails: string[], subject = '') {
        return `mailto:no-reply@unity.edu?bcc=${emails.join(',')}&subject=${subject}`;

    }

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
                    instructors={instructorsForCourse[course.id]}
                    frontPageProfile={sectionFrontPageProfiles[course.id]}
                    facultyProfileMatches={potentialSectionProfiles[course.id]}
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
                        {user && course &&
                            <EmailLink user={user} emails={emails} course={course} sectionStart={sectionStart} termData={term?.rawData}/>}
                    </div>
                    <div className='col-xs-12'>
                        {associatedCourseRows()}
                    </div>
                </div>
            </div>)}
            {info && <div className={`alert ${infoClass}`} role={'alert'}>{info}</div>}
            <div>
                <SectionDetails
                    onUpdateFrontPageProfile={newProfile => workingSection && setSectionFrontPageProfiles({
                        ...sectionFrontPageProfiles,
                        [workingSection.id]: newProfile
                    })}
                    facultyProfileMatches={workingSection && potentialSectionProfiles[workingSection.id]}
                    onClose={() => setWorkingSection(null)}
                    section={workingSection}
                ></SectionDetails>
            </div>

        </Modal>
    </>)
}


