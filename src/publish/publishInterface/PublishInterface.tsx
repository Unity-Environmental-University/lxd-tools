import React, {useEffect, useState} from "react";
import {IProfile, IProfileWithUser, renderProfileIntoCurioFrontPage} from "../../canvas/profile";
import {useEffectAsync} from "../../ui/utils";
import {Button} from "react-bootstrap";
import Modal from "../../ui/widgets/Modal/index";
import {SectionDetails} from "./sectionDetails/SectionDetails";
import {IUserData} from "../../canvas/canvasDataDefs";
import {Temporal} from "temporal-polyfill";
import {EmailLink} from "./EmailLink";
import {SectionRows} from "./SectionRows";
import {MakeBp} from "./MakeBp";
import {Course} from "../../canvas/course/Course";
import {Term} from "@/canvas/Term";
import {getStartDateAssignments} from "@/canvas/course/changeStartDate";
import {renderAsyncGen} from "@/canvas/fetch";
import {assignmentDataGen} from "@/canvas/content/assignments";


export interface IPublishInterfaceProps {
    course?: Course,
    user: IUserData,
}

//TODO: Break this into multiple components
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
    const [isDev, setIsDev] = useState<boolean>(false);
    const [workingSection, setWorkingSection] = useState<Course | null>();

    const [potentialProfilesByCourseId, setPotentialProfilesByCourseId] =
        useState<Record<number, IProfileWithUser[]>>({})
    const [frontPageProfilesByCourseId, setFrontPageProfilesByCourseId] =
        useState<Record<number, IProfile>>({});
    const [instructorsByCourseId, setInstructorsByCourseId] =
        useState<Record<number, IUserData[]>>({});
    const [emails, setEmails] = useState<string[]>([])

    const [errorsByCourseId, setErrorsByCourseId] = useState<Record<number, string[]>>({})
    const [loading, setLoading] = useState<boolean>(false);
    const [infoClass, setInfoClass] = useState<string>('alert-secondary')

    const [unloadWarning, setUnloadWarning] = useState<string | null | undefined>();



    useEffectAsync(async () => {
        if (!course) return;
        setIsBlueprint(course.isBlueprint)
        setIsDev(course.isDev)
        await getFullCourses(
            {
                course,
                setEmails,
                setInstructorsByCourseId,
                setSections,
                setSectionStart,
                setTerm,
                setFrontPageProfilesByCourseId,
            }
        );
    }, [course]);


    useEffectAsync(async () => {
        const profileSet: Record<number, IProfileWithUser[]> = [];

        for (let course of sections)
            profileSet[course.id] ??= await course.getPotentialInstructorProfiles();

        setPotentialProfilesByCourseId(profileSet)
    }, [sections])

    useEffect(() => {
        function handleBeforeUnload(e: BeforeUnloadEvent) {
            if (unloadWarning) {
                e.preventDefault();
                e.returnValue = unloadWarning;
                return unloadWarning;
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, []);

    //-----
    // EVENTS
    //-----
    async function publishCourses(event: React.MouseEvent) {
        const accountId = course?.getItem<number>('account_id');
        if (typeof accountId === 'undefined') throw new Error('Course has no account Id');
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

    async function applySectionProfiles(_?: React.MouseEvent) {
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

    type BpSectionInterface = {
        course: Course,
        user: IUserData | undefined,
    }

    function RenderBpInterface({course, user}: BpSectionInterface) {

        return <>{!workingSection && (<div>
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
                    {SectionRows({
                        sections,
                        onOpenAll: openAll,
                        instructorsByCourseId,
                        errorsByCourseId,
                        frontPageProfilesByCourseId,
                        potentialProfilesByCourseId,
                        setWorkingSection
                    })}
                </div>

            </div>
        </div>)}
            {info && <div className={`alert ${infoClass}`} role={'alert'}>{info}</div>}
            {workingSection && <div>
                <SectionDetails
                    onUpdateFrontPageProfile={newProfile => workingSection && setFrontPageProfilesByCourseId({
                        ...frontPageProfilesByCourseId,
                        [workingSection.id]: newProfile
                    })}
                    facultyProfileMatches={workingSection && potentialProfilesByCourseId[workingSection.id]}
                    onClose={() => setWorkingSection(null)}
                    section={workingSection}
                ></SectionDetails>
            </div>}
        </>
    }


    return (<>
        <OpenButton isDev={isDev} isBlueprint={isBlueprint} setShow={setShow}/>
        <Modal id={'lxd-publish-interface'} isOpen={show} canClose={!loading} requestClose={() => {
            if (!loading) setShow(false);
        }}>
            {course && isBlueprint && <RenderBpInterface course={course} user={user}/>}
            {course && isDev && <MakeBp
                devCourse={course}
                onStartMigration={() => {
                    setUnloadWarning("Migration in progress. BP settings may not finish if you leave this page.")
                    setLoading(true);
                }}
                onEndMigration={() => {
                    setLoading(false);
                    setUnloadWarning(null)
                }}
            />}
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
    setInstructorsByCourseId: (instructorsByCourseId: Record<number, IUserData[]>) => void,
    setSections: (course: Course[]) => void,
    setSectionStart: (start: Temporal.PlainDateTime) => void,
    setTerm: (term: Term | null) => void,
    setFrontPageProfilesByCourseId: (profiles: Record<number, IProfile>) => void,

}

export async function getFullCourses({
    course,
    setEmails,
    setInstructorsByCourseId,
    setSections,
    setSectionStart,
    setTerm,
    setFrontPageProfilesByCourseId,
}: IGetFullCoursesProps) {
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
                if(!actualStart) {
                    actualStart = getStartDateAssignments(await renderAsyncGen(assignmentDataGen(section.id)))
                }

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
                setInstructorsByCourseId({...allInstructors})
            }

            const emails = instructors?.map(a => a.email);
            emails?.forEach(email => allEmails.add(email));
            if (emails) setEmails([...allEmails]);
        }
    }
}


type OpenButtonProps = {
    isDev: boolean,
    isBlueprint: boolean,
    setShow: (value: boolean) => any
}

export function OpenButton({isDev, isBlueprint, setShow}: OpenButtonProps) {
    const disabled = !(isBlueprint || isDev);
    let label = 'Not BP or DEV';
    if (isBlueprint) label = "Manage Sections";
    if (isDev) label = "Manage DEV->BP"

    return <Button
        disabled={disabled}
        className={disabled ? '' : 'ui-button'}
        onClick={(e) => setShow(true)}
    >{label}</Button>
}