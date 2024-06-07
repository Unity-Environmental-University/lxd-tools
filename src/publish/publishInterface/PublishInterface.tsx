import React, {useState} from "react";
import {IProfile, renderProfileIntoCurioFrontPage} from "../../canvas/profile";
import {useEffectAsync} from "../../ui/utils";
import assert from "assert";
import {Button} from "react-bootstrap";
import Modal from "../../ui/widgets/Modal/index";
import {SectionDetails} from "./sectionDetails/SectionDetails";
import {Course} from "../../canvas/course";
import {IUserData} from "../../canvas/canvasDataDefs";
import {Term} from "../../canvas/index";
import {Temporal} from "temporal-polyfill";
import {EmailLink} from "./EmailLink";
import {SectionRows} from "./SectionRows";


export interface IPublishInterfaceProps {
    course?: Course,
    user: IUserData,
}

export function PublishInterface({course, user}: IPublishInterfaceProps) {
    //-----
    // DATA
    //-----
    const [show, setShow] = useState<boolean>(false)
    const [info, setInfo] = useState<string | null | boolean>(null);
    const [sections, setSections] = useState<Course[]>([])
    const [term, setTerm] = useState<Term | null>();
    const [sectionStart, setSectionStart] = useState<Temporal.PlainDateTime>();
    const [isBlueprint, setIsBlueprint] = useState<boolean>(false);
    const [workingSection, setWorkingSection] = useState<Course | null>();

    const [potentialProfilesByCourseId, setPotentialProfilesByCourseId] = useState<Record<number, IProfile[]>>({})
    const [frontPageProfilesByCourseId, setFrontPageProfilesByCourseId] = useState<Record<number, IProfile>>({});
    const [instructorsForCourse, setInstructorsForCourse] = useState<Record<number, IUserData[]>>({});
    const [emails, setEmails] = useState<string[]>([])

    const [errorsByCourseId, setErrorsByCourseId] = useState<Record<number, string[]>>({})
    const [loading, setLoading] = useState<boolean>(false);
    const [infoClass, setInfoClass] = useState<string>('alert-secondary')

    useEffectAsync(async () => {
        if (!course) return;
        setIsBlueprint(course.isBlueprint)
        await getFullCourses(
            {
                course,
                setEmails,
                setInstructorsForCourse,
                setSections,
                setSectionStart,
                setTerm,
                setFrontPageProfilesByCourseId,
            }
        );
    }, [course]);


    useEffectAsync(async () => {
        const profileSet: Record<number, IProfile[]> = [];
        for (let course of sections) {

            profileSet[course.id] ??= await course.getPotentialInstructorProfiles();
        }
        setPotentialProfilesByCourseId(profileSet)
    }, [sections])

    //-----
    // EVENTS
    //-----
    async function publishCourses(event: React.MouseEvent) {
        const accountId = course?.getItem<number>('account_id');
        if(typeof accountId === 'undefined') throw new Error('Course has no account Id');
        inform('Publishing')
        setLoading(true);
        await Course.publishAll(sections, accountId)
        //Waits half a second to allow changes to propagate on the server
        window.setTimeout(async () => {
            let newAssocCourses = await course?.getAssociatedCourses();
            if (newAssocCourses) {
                newAssocCourses = [...newAssocCourses];
            } else {
                newAssocCourses = [];
            }
            setSections(newAssocCourses);
            setLoading(false);
            success('Published');
        }, 500);
    }

    function openAll() {
        for (let course of sections) {
            window.open(course.courseUrl, "_blank");
        }
    }

    function sectionError(section: Course, error: string) {
        let tempErrors = {...errorsByCourseId}
        let errorSet = tempErrors[section.id] ?? [];
        errorSet.push(error);
        tempErrors[section.id] = errorSet
        setErrorsByCourseId({...tempErrors})
    }

    async function applySectionProfiles(event: React.MouseEvent) {
        setLoading(true);
        inform("Updating section profiles...");
        const currentProfiles = {...frontPageProfilesByCourseId};
        setErrorsByCourseId({});
        for (let section of sections) {
            const profiles = potentialProfilesByCourseId[section.id];
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
            setFrontPageProfilesByCourseId({...currentProfiles});
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
                            <EmailLink user={user} emails={emails} course={course} sectionStart={sectionStart}
                                       termData={term?.rawData}/>}
                    </div>
                    <div className='col-xs-12'>
                        <SectionRows
                            sections={sections}
                            onOpenAll={openAll}
                            instructorsByCourseId={instructorsForCourse}
                            errorsByCourseId={errorsByCourseId}
                            frontPageProfilesByCourseId={frontPageProfilesByCourseId}
                            potentialProfilesByCourseId={potentialProfilesByCourseId}
                            setWorkingSection={setWorkingSection}/>
                    </div>

                </div>
            </div>)}
            {info && <div className={`alert ${infoClass}`} role={'alert'}>{info}</div>}
            <div>
                <SectionDetails
                    onUpdateFrontPageProfile={newProfile => workingSection && setFrontPageProfilesByCourseId({
                        ...frontPageProfilesByCourseId,
                        [workingSection.id]: newProfile
                    })}
                    facultyProfileMatches={workingSection && potentialProfilesByCourseId[workingSection.id]}
                    onClose={() => setWorkingSection(null)}
                    section={workingSection}
                ></SectionDetails>
            </div>

        </Modal>
    </>)
}

async function loadSection(course: Course) {
    const section = await Course.getCourseById(course.id);
    const frontPageProfile = await section.getFrontPageProfile();
    const instructors = await section.getInstructors();
    return {section, instructors, frontPageProfile}
}


export interface IGetFullCoursesProps {
    course: Course,
    setEmails: (emails: string[]) => void,
    setInstructorsForCourse: (instructorsByCourseId: Record<number, IUserData[]>) => void,
    setSections: (course: Course[]) => void,
    setSectionStart: (start: Temporal.PlainDateTime) => void,
    setTerm: (term: Term | null) => void,
    setFrontPageProfilesByCourseId: (profiles: Record<number, IProfile>) => void,

}

export async function getFullCourses({
    course,
    setEmails,
    setInstructorsForCourse,
    setSections,
    setSectionStart,
    setTerm,
    setFrontPageProfilesByCourseId,
}: IGetFullCoursesProps) {
    console.log("Getting Full Courses");
    const sections: Course[] = [];
    const fetchedCourses = await course.getAssociatedCourses() ?? [];
    const frontPageProfiles: Record<number, IProfile> = {};
    const allInstructors: Record<number, IUserData[]> = {};
    const allEmails = new Set<string>();
    const batchLoadSize = 5;
    let sectionStartSet = false;
    for (let i = 0; i < fetchedCourses.length; i += batchLoadSize) {
        const batch = fetchedCourses.slice(i, i + batchLoadSize);
        const results = await Promise.all(batch.map(loadSection));
        let tempTerm: Term | null = null;

        for (let {section, instructors, frontPageProfile} of results) {
            if (!sectionStartSet) {
                let actualStart = await section.getStartDateFromModules();
                sectionStartSet = true;
                setSectionStart(Temporal.PlainDateTime.from(actualStart));
            }

            if (!tempTerm) {
                tempTerm = await section.getTerm();
                setTerm(tempTerm);
            }

            sections.push(section);
            setSections([...sections]);

            frontPageProfiles[section.id] = frontPageProfile;
            setFrontPageProfilesByCourseId({...frontPageProfiles});

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


