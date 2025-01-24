import React, {useEffect, useReducer, useState} from "react";
import {renderProfileIntoCurioFrontPage} from "@canvas/profile";
import {useEffectAsync} from "@/ui/utils";
import {Button} from "react-bootstrap";
import Modal from "@/ui/widgets/Modal/index";
import {SectionDetails} from "./sectionDetails/SectionDetails";
import {IUserData} from "@/canvas/canvasDataDefs";
import {Temporal} from "temporal-polyfill";
import {EmailLink} from "./EmailLink";
import {SectionRows} from "./SectionRows";
import {MakeBp} from "./MakeBp";
import {Course} from "@/canvas/course/Course";
import {Term} from "@/canvas/term/Term";
import {getStartDateAssignments} from "@/canvas/course/changeStartDate";
import {assignmentDataGen} from "@/canvas/content/assignments";
import {IListAction, lutDispatcher} from "@/ui/reducerDispatchers";
import {sectionDataGenerator} from "@/canvas/course/blueprint";
import {batchGen, renderAsyncGen} from "@/canvas/canvasUtils";
import {getCourseData} from "@canvas/course";
import {sleep} from "@/toolbox";
import {IProfile, IProfileWithUser} from "@canvas/type";


export interface IPublishInterfaceProps {
    course?: Course,
    user: IUserData,
}

export function PublishInterface({course, user}: IPublishInterfaceProps) {
    type SectionInfo = { section: Course, instructors: IUserData[] | null, frontPageProfile: IProfile | null };

    //-----
    // DATA
    //-----
    const [show, setShow] = useState<boolean>(false)
    const [info, setInfo] = useState<string | null | boolean>(null);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [sections, dispatchSections] = useReducer(lutDispatcher<number, Course>, {} as Record<number, Course>)
    const [term, setTerm] = useState<Term | null>();
    const [sectionStart, setSectionStart] = useState<Temporal.PlainDateTime>();
    const [isBlueprint, setIsBlueprint] = useState<boolean>(false);
    const [isDev, setIsDev] = useState<boolean>(false);
    const [workingSection, setWorkingSection] = useState<Course | null>();
    const [workingCourseId, setWorkingCourseId] = useState<number | undefined>();
    const [sectionInfoCache, dispatchSectionInfoCache] = useReducer(
        lutDispatcher<number, SectionInfo | 'loading'>,
        {} as Record<number, SectionInfo | 'loading'>
    )
    const [potentialProfilesByCourseId, dispatchPotentialProfilesByCourseId] = useReducer(
        lutDispatcher<number, IProfileWithUser[]>,
        {} as Record<number, IProfileWithUser[]>
    )
    useState<Record<number, IProfileWithUser[]>>({})
    const [frontPageProfilesByCourseId, dispatchFrontPageProfilesByCourseId] = useReducer(
        lutDispatcher<number, IProfile>,
        {} as Record<number, IProfile>
    );
    const [instructorsByCourseId, dispatchInstructorsByCourseId] = useReducer(
        lutDispatcher<number, IUserData[]>,
        {} as Record<number, IUserData[]>
    );

    const [emails, setEmails] = useState<string[]>([])

    const [errorsByCourseId, setErrorsByCourseId] = useState<Record<number, string[]>>({})
    const [loading, setLoading] = useState<boolean>(false);
    const [infoClass, setInfoClass] = useState<string>('alert-secondary')

    const [unloadWarning, setUnloadWarning] = useState<string | null | undefined>();


    useEffectAsync(async () => {
        if (!course) return;
        setIsBlueprint(course.isBlueprint)
        setIsDev(course.isDev)
        if (course.id !== workingCourseId) {
            setWorkingCourseId(course.id);
            await getFullCourses(course)
        }
         //ONLY refresh courses if it's a new course being set.
    }, [course]);


    useEffect(() => {
        function handleBeforeUnload(e: BeforeUnloadEvent) {
            if (unloadWarning) {
                e.preventDefault();
                e.returnValue = unloadWarning; //legacy support
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
        const toPublish = Object.values(sections);
        await Course.publishAll(toPublish, accountId)
        //Waits half a second to allow changes to propagate on the server
        window.setTimeout(async () => {
            let newAssocCourses = await course?.getAssociatedCourses();
            if (newAssocCourses) {
                newAssocCourses = [...newAssocCourses];
            } else {
                newAssocCourses = [];
            }

            dispatchSections({set: Object.fromEntries(newAssocCourses.map(a => [ a.id, a]))});
            setLoading(false);
            success('Published');
        }, 500);
    }

    async function loadSection(courseId: number) {
        if (sectionInfoCache[courseId]) {
            if (sectionInfoCache[courseId] !== 'loading') return sectionInfoCache[courseId];
            for (let i = 0; i < 10; i++) {
                await sleep(200);
                if (sectionInfoCache[courseId] !== 'loading') return sectionInfoCache[courseId];
            }
            throw new Error(`Problem loading section ${courseId}`)
        }
        dispatchSectionInfoCache({set: [courseId, 'loading']});

        const sectionData = await getCourseData(courseId, {
            queryParams: { include:['total_students']}
        })
        const section = new Course(sectionData);

        const frontPageProfile = await section.getFrontPageProfile();
        const instructors = await section.getInstructors();
        const out = {section, instructors, frontPageProfile};

        if (!potentialProfilesByCourseId[section.id]) {
        const profiles = await section.getPotentialInstructorProfiles();
            dispatchPotentialProfilesByCourseId({set: [section.id, profiles]})
        }
        dispatchSectionInfoCache({set: [courseId, out]});
        return out;
    }


    function openAll() {
        for (const course of Object.values(sections)) {
            window.open(course.courseUrl, "_blank");
        }
    }

    function sectionError(section: Course, error: string) {
        const tempErrors = {...errorsByCourseId}
        const errorSet = tempErrors[section.id] ?? [];
        errorSet.push(error);
        tempErrors[section.id] = errorSet
        setErrorsByCourseId({...tempErrors})
    }

    async function applySectionProfiles(_?: React.MouseEvent) {
        setLoading(true);
        inform("Updating section profiles...");
        const currentProfiles = {...frontPageProfilesByCourseId};
        setErrorsByCourseId({});
        for (const section of Object.values(sections)) {
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
            dispatchFrontPageProfilesByCourseId({
                set: {[section.id]: profile}
            })
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

    async function getFullCourses(course: Course) {
        if (coursesLoading) return;
        setCoursesLoading(true);
        const sectionGen = sectionDataGenerator(course.id, { queryParams: {'per_page': 5}});
        const allInstructors: Record<number, IUserData[]> = {};
        const allEmails = new Set<string>();
        let sectionStartSet = false;

        let tempTerm: Term | null = null;

        let actualStart: Temporal.PlainDate | null;
        for await (const sectionInfos of batchGen(sectionGen, 6)) {
            const promises = sectionInfos.map(sectionInfo => (async () => {
                const result = await loadSection(sectionInfo.id);
                console.log(result);

                const {section, instructors, frontPageProfile} = result;
                if (!sectionStartSet) {
                    actualStart = await section.getStartDateFromModules();
                    if (!actualStart) {
                        actualStart = getStartDateAssignments(await renderAsyncGen(assignmentDataGen(section.id)))
                    }

                    sectionStartSet = true;
                    setSectionStart(Temporal.PlainDateTime.from(actualStart));
                }

                if (!tempTerm) {
                    tempTerm = await section.getTerm();
                    setTerm(tempTerm);
                }

                dispatchSections({set: [section.id, section]});
                if (frontPageProfile) dispatchFrontPageProfilesByCourseId({
                    set: [section.id, frontPageProfile]
                })


                if (instructors) {
                    dispatchInstructorsByCourseId({
                        set: [section.id, instructors]
                    })
                }

                if(section.data.total_students && section.data.total_students > 0) {
                    const emails = instructors?.map(a => a.email);
                    emails?.forEach(email => allEmails.add(email));
                    if (emails) setEmails([...allEmails]);
                }
            }))
            await Promise.all(promises.map(a => a()));
        }
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
                        sections: Object.values(sections),
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
                    onUpdateFrontPageProfile={newProfile => workingSection && dispatchFrontPageProfilesByCourseId({
                        set: [workingSection.id, frontPageProfilesByCourseId]
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


export interface IGetFullCoursesProps {
    course: Course,
    setEmails: (emails: string[]) => void,
    setInstructorsByCourseId: (instructorsByCourseId: Record<number, IUserData[]>) => void,
    dispatchSections: React.Dispatch<IListAction<Course>>,
    setSectionStart: (start: Temporal.PlainDateTime) => void,
    setTerm: (term: Term | null) => void,
    setFrontPageProfilesByCourseId: (profiles: Record<number, IProfile>) => void,
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