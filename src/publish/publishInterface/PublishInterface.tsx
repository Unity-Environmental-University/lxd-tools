import React, { useEffect, useReducer, useState } from "react";
import { useEffectAsync } from "@/ui/utils";
import { Button } from "react-bootstrap";
import Modal from "@/ui/widgets/Modal/index";
import { SectionDetails } from "./sectionDetails/SectionDetails";
import { IUserData } from "@ueu/ueu-canvas/canvasDataDefs";
import { Temporal } from "temporal-polyfill";
import { EmailLink } from "./EmailLink";
import { SectionRows } from "./SectionRows";
import { ProfileTemplateHelp } from "./ProfileTemplateHelp";
import { MakeBp } from "./MakeBp";
import { Course } from "@ueu/ueu-canvas/course/Course";
import { Term } from "@ueu/ueu-canvas/term/Term";
import { getStartDateAssignments } from "@ueu/ueu-canvas/course/changeStartDate";
import { IListAction, lutDispatcher, LutSetAction } from "@/ui/reducerDispatchers";
import { sectionDataGenerator } from "@ueu/ueu-canvas/course/blueprint";
import { batchGen } from "@ueu/ueu-canvas/canvasUtils";
import { getCourseData } from "@ueu/ueu-canvas/course";
import { sleep } from "@/utils/toolbox";
import { IProfile, IProfileWithUser } from "@ueu/ueu-canvas/type";
import isEqual from "lodash/isEqual";
import {
  findProfilePageSlug,
  getProfilePage,
  ProfilePageResult,
  restrictBlueprintPage,
} from "@publish/fixesAndUpdates/courseDataStore";
import { renderProfile } from "@publish/fixesAndUpdates/profileRenderer";

export interface IPublishInterfaceProps {
  course?: Course;
  user: IUserData;
}

export function PublishInterface({ course, user }: IPublishInterfaceProps) {
  type SectionInfo = { section: Course; instructors: IUserData[] | null; frontPageProfile: IProfile | null };

  //-----
  // DATA
  //-----
  const [show, setShow] = useState<boolean>(false);
  const [info, setInfo] = useState<string | null | boolean>(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [sections, dispatchSections] = useReducer(lutDispatcher<number, Course>, {} as Record<number, Course>);
  const [sectionsToPublish, setSectionsToPublish] = useReducer(
    lutDispatcher<number, Course>,
    {} as Record<number, Course>
  );
  const [term, setTerm] = useState<Term | null>();
  const [sectionStart, setSectionStart] = useState<Temporal.PlainDateTime>();
  const [isBlueprint, setIsBlueprint] = useState<boolean>(false);
  const [isDev, setIsDev] = useState<boolean>(false);
  const [workingSection, setWorkingSection] = useState<Course | null>();
  const [workingCourseId, setWorkingCourseId] = useState<number | undefined>();
  const [sectionInfoCache, dispatchSectionInfoCache] = useReducer(
    lutDispatcher<number, SectionInfo | "loading">,
    {} as Record<number, SectionInfo | "loading">
  );
  const [potentialProfilesByCourseId, dispatchPotentialProfilesByCourseId] = useReducer(
    lutDispatcher<number, IProfileWithUser[]>,
    {} as Record<number, IProfileWithUser[]>
  );
  useState<Record<number, IProfileWithUser[]>>({});
  const [frontPageProfilesByCourseId, dispatchFrontPageProfilesByCourseId] = useReducer(
    lutDispatcher<number, IProfile>,
    {} as Record<number, IProfile>
  );
  const [instructorsByCourseId, dispatchInstructorsByCourseId] = useReducer(
    lutDispatcher<number, IUserData[]>,
    {} as Record<number, IUserData[]>
  );

  const [emails, setEmails] = useState<string[]>([]);
  // A single ProfilePageResult, not separate slug/error/pageId fields: those
  // three only ever have meaning together (a "found" result has slug and
  // blueprintPageId; anything else has neither), so keeping them as one
  // useState means they can't independently go stale relative to each other.
  const [profileResolution, setProfileResolution] = useState<ProfilePageResult | null>(null);

  const [errorsByCourseId, setErrorsByCourseId] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [infoClass, setInfoClass] = useState<string>("alert-secondary");

  const [unloadWarning, setUnloadWarning] = useState<string | null | undefined>();

  useEffectAsync(async () => {
    if (!course) return;
    setIsBlueprint(course.isBlueprint);
    setIsDev(course.isDev);
    if (course.id !== workingCourseId) {
      setWorkingCourseId(course.id);
      await getFullCourses(course);
    }
    //ONLY refresh courses if it's a new course being set.
  }, [course]);

  useEffectAsync(async () => {
    if (!course) {
      setProfileResolution(null);
      return;
    }
    setProfileResolution(await findProfilePageSlug(course.id));
  }, [course]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (unloadWarning) {
        e.preventDefault();
        e.returnValue = unloadWarning; //legacy support
        return unloadWarning;
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  //-----
  // EVENTS
  //-----
  async function publishCourses(event: React.MouseEvent, sections: Record<number, Course> = sectionsToPublish) {
    const accountId = course?.getItem<number>("account_id");
    if (typeof accountId === "undefined") throw new Error("Course has no account Id");
    inform("Publishing");
    setLoading(true);
    const toPublish = Object.values(sections);
    const numToPublish = toPublish.length;
    await Course.publishAll(toPublish, accountId);
    //Waits half a second to allow changes to propagate on the server
    window.setTimeout(async () => {
      let newAssocCourses = (await course?.getAssociatedCourses()) as Course[] | undefined;
      if (newAssocCourses) {
        newAssocCourses = [...newAssocCourses];
      } else {
        newAssocCourses = [];
      }

      dispatchSections({ set: Object.fromEntries(newAssocCourses.map((a) => [a.id, a])) });
      setLoading(false);
      success("Published " + numToPublish + " sections");
    }, 500);
  }

  async function loadSection(courseId: number) {
    if (sectionInfoCache[courseId]) {
      if (sectionInfoCache[courseId] !== "loading") return sectionInfoCache[courseId];
      for (let i = 0; i < 10; i++) {
        await sleep(200);
        if (sectionInfoCache[courseId] !== "loading") return sectionInfoCache[courseId];
      }
      throw new Error(`Problem loading section ${courseId}`);
    }
    dispatchSectionInfoCache({ set: [courseId, "loading"] });

    const sectionData = await getCourseData(courseId, {
      queryParams: { include: ["total_students"] },
    });
    const section = new Course(sectionData);

    const frontPageProfile = await section.getFrontPageProfile();
    const instructors = await section.getInstructors();
    const out = { section, instructors, frontPageProfile };

    if (!potentialProfilesByCourseId[section.id]) {
      const profiles = await section.getPotentialInstructorProfiles();
      dispatchPotentialProfilesByCourseId({ set: [section.id, profiles] });
    }
    dispatchSectionInfoCache({ set: [courseId, out] });
    return out;
  }

  function openAll() {
    for (const course of Object.values(sections)) {
      window.open(course.courseUrl, "_blank");
    }
  }

  function sectionError(section: Course, error: string) {
    const tempErrors = { ...errorsByCourseId };
    const errorSet = tempErrors[section.id] ?? [];
    errorSet.push(error);
    tempErrors[section.id] = errorSet;
    setErrorsByCourseId({ ...tempErrors });
  }

  async function applySectionProfiles(_?: React.MouseEvent) {
    setLoading(true);
    inform("Updating section profiles...");
    const _currentProfiles = { ...frontPageProfilesByCourseId };
    setErrorsByCourseId({});

    // No fallback: a course must resolve to exactly one data-attribute profile
    // page (see the resolution effect above), or every section errors visibly
    // instead of silently targeting the wrong page.
    if (profileResolution?.status !== "found") {
      const message =
        profileResolution?.status === "ambiguous"
          ? `Multiple profile pages: ${profileResolution.candidates.join(", ")}`
          : "No profile page found on blueprint";
      for (const section of Object.values(sections)) {
        sectionError(section, message);
      }
      setLoading(false);
      inform("No profiles updated — see errors below", "alert-danger");
      return;
    }
    const { slug: profileSlug, blueprintPageId } = profileResolution;

    let updatedCount = 0;
    let unlocked = false;
    try {
      // Section copies of a blueprint page are locked against direct edits
      // by default. Unlock the blueprint's page for the duration of this
      // pass so the writes below aren't rejected, then always re-lock it
      // afterward — Canvas has no API to read whether it was already
      // unlocked, so "restore" here means "back to locked," not "back to
      // whatever it was." This unlock is inside the try (not before it) so
      // that a thrown error here still reaches the finally below and resets
      // loading state instead of leaving the UI stuck on "Updating...".
      if (course) {
        await restrictBlueprintPage(course.id, blueprintPageId, false);
        unlocked = true;
      }

      for (const section of Object.values(sections)) {
        const profiles = potentialProfilesByCourseId[section.id] ?? [];
        if (profiles.length < 1) {
          sectionError(section, "No Profiles");
          continue;
        }
        if (profiles.length > 1) {
          sectionError(section, "Multiple Matches Found");
          continue;
        }
        const profile = profiles[0];

        const targetPage = await getProfilePage(section.id, profileSlug);
        if (!targetPage) {
          sectionError(section, `Profile page "${profileSlug}" not found`);
          continue;
        }

        const html = renderProfile(targetPage.body, profile, section.id);
        await targetPage.updateContent(html);
        dispatchFrontPageProfilesByCourseId({
          set: { [section.id]: profile },
        });
        setInfo(`Updated ${profile.displayName}...`);
        updatedCount++;
      }
    } finally {
      if (course && unlocked) {
        await restrictBlueprintPage(course.id, blueprintPageId, true);
      }
      setLoading(false);
    }
    if (updatedCount > 0) {
      success(`${updatedCount} profile(s) updated`);
    } else {
      inform("No profiles updated — see errors below", "alert-danger");
    }
  }

  function inform(message: string, alertClass: string = "alert-secondary") {
    setInfo(message);
    setInfoClass(alertClass);
  }

  function success(message: string) {
    inform(message, "alert-success");
  }

  async function getFullCourses(course: Course) {
    if (coursesLoading) return;
    setCoursesLoading(true);
    const sectionGen = sectionDataGenerator(course.id, { queryParams: { per_page: 5 } });
    const _allInstructors: Record<number, IUserData[]> = {};
    const allEmails = new Set<string>();
    let sectionStartSet = false;

    let tempTerm: Term | null = null;

    let actualStart: Temporal.PlainDate | null;
    for await (const sectionInfos of batchGen(sectionGen, 6)) {
      const promises = sectionInfos.map((sectionInfo) => async () => {
        const result = await loadSection(sectionInfo.id);
        console.log(result);

        const { section, instructors, frontPageProfile } = result;
        if (!sectionStartSet) {
          actualStart = await section.getStartDateFromModules();
          if (!actualStart) {
            actualStart = await getStartDateAssignments(section.id);
          }

          sectionStartSet = true;
          setSectionStart(Temporal.PlainDateTime.from(actualStart));
        }

        if (!tempTerm) {
          tempTerm = await section.getTerm();
          setTerm(tempTerm);
        }

        dispatchSections({ set: [section.id, section] });
        if (frontPageProfile)
          dispatchFrontPageProfilesByCourseId({
            set: [section.id, frontPageProfile],
          });

        setSectionsToPublish({ set: [section.id, section] });
        if (frontPageProfile)
          dispatchFrontPageProfilesByCourseId({
            set: [section.id, frontPageProfile],
          });

        if (instructors) {
          dispatchInstructorsByCourseId({
            set: [section.id, instructors],
          });
        }

        if (section.data.total_students && section.data.total_students > 0) {
          const emails = instructors?.map((a) => a.email);
          emails?.forEach((email) => allEmails.add(email));
          if (emails) setEmails([...allEmails]);
        }
      });
      await Promise.all(promises.map((a) => a()));
    }
    setCoursesLoading(false);
  }

  const sectionPublishToggle = (course: Course, publish: boolean) => {
    const payload: LutSetAction<number, Course> = {
      // map‐style LutSetAction: each key ∈ RecordKeyType mapped to a single Course
      [course.id]: publish ? course : (undefined as any),
    } as LutSetAction<number, Course>;

    setSectionsToPublish({ set: payload });
  };

  //-----
  // RENDER
  //-----

  type BpSectionInterface = {
    course: Course;
    user: IUserData | undefined;
  };

  console.log(sectionsToPublish);

  function RenderBpInterface({ course, user }: BpSectionInterface) {
    const sectionsListIdentical = isEqual(sections, sectionsToPublish);
    const selectedSectionsEmpty = Object.values(sectionsToPublish).every((v) => v === undefined);

    return (
      <>
        {!workingSection && (
          <div>
            <div className="row">
              <div className={"col-xs-12"}>
                <h3>Sections</h3>
              </div>
              <div className={"col-xs-12 col-sm-12"} style={{ marginBottom: "5px" }}>
                Publish sections associated with this blueprint
              </div>
              <div className={"col-xs-2"} style={{ display: "contents" }}>
                <Button
                  className="btn"
                  disabled={loading || !course?.isBlueprint}
                  onClick={applySectionProfiles}
                  style={{ marginLeft: "8px" }}
                >
                  Set Bios
                </Button>
                {!sectionsListIdentical && (
                  <Button
                    className="btn"
                    disabled={selectedSectionsEmpty || loading || !course?.isBlueprint}
                    onClick={applySectionProfiles}
                    style={{ marginLeft: "8px" }}
                  >
                    Set Selected Bios
                  </Button>
                )}
                <Button
                  className="btn"
                  disabled={loading || !course?.isBlueprint}
                  onClick={(e) => publishCourses(e, sections)}
                  style={{ marginLeft: "8px" }}
                >
                  Publish all
                </Button>
                {!sectionsListIdentical && (
                  <Button
                    className="btn"
                    disabled={selectedSectionsEmpty || loading || !course?.isBlueprint}
                    onClick={(e) => publishCourses(e, sectionsToPublish)}
                    style={{ marginLeft: "8px" }}
                  >
                    Publish selected
                  </Button>
                )}
                <ProfileTemplateHelp blueprintCourse={course} />
              </div>
              <div className={"col-xs-12"} style={{ marginTop: "5px" }}>
                {user && course && (
                  <EmailLink
                    user={user}
                    emails={emails}
                    course={course}
                    sectionStart={sectionStart}
                    termData={term?.rawData}
                  />
                )}
              </div>
              <div className="col-xs-12">
                <SectionRows
                  sections={Object.values(sections /* or however you get your list */)}
                  onOpenAll={openAll}
                  instructorsByCourseId={instructorsByCourseId}
                  frontPageProfilesByCourseId={frontPageProfilesByCourseId}
                  potentialProfilesByCourseId={potentialProfilesByCourseId}
                  errorsByCourseId={errorsByCourseId}
                  profileSlug={profileResolution?.status === "found" ? profileResolution.slug : null}
                  profileSlugError={
                    profileResolution?.status === "ambiguous"
                      ? `Multiple profile pages: ${profileResolution.candidates.join(", ")}`
                      : profileResolution?.status === "none"
                        ? "No profile page found on blueprint"
                        : null
                  }
                  setWorkingSection={setWorkingSection}
                  // ← HERE: pass your local variable into the prop
                  sectionPublishRecord={sectionsToPublish}
                  sectionPublishToggle={sectionPublishToggle}
                />
              </div>
            </div>
          </div>
        )}
        {info && (
          <div className={`alert ${infoClass}`} role={"alert"}>
            {info}
          </div>
        )}
        {workingSection && (
          <div>
            <SectionDetails
              onUpdateFrontPageProfile={(_newProfile) =>
                dispatchFrontPageProfilesByCourseId({
                  set: [workingSection.id, frontPageProfilesByCourseId],
                })
              }
              facultyProfileMatches={potentialProfilesByCourseId[workingSection.id]}
              onClose={() => setWorkingSection(null)}
              section={workingSection}
              blueprintCourse={course}
            ></SectionDetails>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <OpenButton isDev={isDev} isBlueprint={isBlueprint} setShow={setShow} />
      <Modal
        id={"lxd-publish-interface"}
        isOpen={show}
        canClose={!loading}
        requestClose={() => {
          if (!loading) setShow(false);
        }}
      >
        {course && isBlueprint && <RenderBpInterface course={course} user={user} />}
        {course && isDev && (
          <MakeBp
            devCourse={course}
            onStartMigration={() => {
              setUnloadWarning("Migration in progress. BP settings may not finish if you leave this page.");
              setLoading(true);
            }}
            onEndMigration={() => {
              setLoading(false);
              setUnloadWarning(null);
            }}
          />
        )}
      </Modal>
    </>
  );
}

export interface IGetFullCoursesProps {
  course: Course;
  setEmails: (emails: string[]) => void;
  setInstructorsByCourseId: (instructorsByCourseId: Record<number, IUserData[]>) => void;
  dispatchSections: React.Dispatch<IListAction<Course>>;
  setSectionStart: (start: Temporal.PlainDateTime) => void;
  setTerm: (term: Term | null) => void;
  setFrontPageProfilesByCourseId: (profiles: Record<number, IProfile>) => void;
}

type OpenButtonProps = {
  isDev: boolean;
  isBlueprint: boolean;
  setShow: (value: boolean) => any;
};

export function OpenButton({ isDev, isBlueprint, setShow }: OpenButtonProps) {
  const disabled = !(isBlueprint || isDev);
  let label = "Not BP or DEV";
  if (isBlueprint) label = "Manage Sections";
  if (isDev) label = "Manage DEV->BP";

  return (
    <Button disabled={disabled} className={disabled ? "" : "ui-button"} onClick={(_e) => setShow(true)}>
      {label}
    </Button>
  );
}
