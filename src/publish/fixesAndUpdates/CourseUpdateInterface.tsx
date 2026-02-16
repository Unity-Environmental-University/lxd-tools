import React, { useEffect, useState } from "react";
import { useEffectAsync } from "../../ui/utils";
import { Button } from "react-bootstrap";
import Modal from "../../ui/widgets/Modal/index";
import { fixLmAnnotations } from "@ueu/ueu-canvas";
import assert from "assert";
import { UpdateStartDate } from "./UpdateStartDate";
import { CourseValidator } from "./CourseValidator";
import { Course } from "@ueu/ueu-canvas";
import { Page } from "@ueu/ueu-canvas";
import { CourseValidation } from "@publish/fixesAndUpdates/validations/types";

export type CourseUpdateInterfaceProps = {
  course?: Course;
  parentCourse?: Course;
  onChangeMode?: (mode: InterfaceMode) => any;
  allValidations: CourseValidation<Course, any, any>[];
  refreshCourse: () => Promise<void>;
};

export class MismatchedUnloadError extends Error {
  public name = "Mismatched Unload Error";
}

export type InterfaceMode = "fix" | "unitTest";

export function CourseUpdateInterface({
  course,
  refreshCourse,
  allValidations,
  onChangeMode,
}: CourseUpdateInterfaceProps) {
  const [validations, setValidations] = useState<CourseValidation<Course, any, any>[]>([]);
  const [show, setShow] = useState(false);
  const [buttonText, setButtonText] = useState("Content Fixes");
  const [affectedItems, setAffectedItems] = useState<React.ReactElement[]>([]);
  const [_, setUnaffectedItems] = useState<React.ReactElement[]>([]);
  const [failedItems, setFailedItems] = useState<React.ReactElement[]>([]);
  const [deannotatingCount, setLoadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<InterfaceMode>("fix");
  const [startDateSetMode, setStartDateSetMode] = useState(false);
  const [batchingValidations, setBatchingValidations] = useState(false);
  const [showUpdateStartDate, setShowUpdateStartDate] = useState(false);
  const [isChangingStartDate, setIsChangingStartDate] = useState(false);

  const runValidationsDisabled = !course || isRemovingAnnotations() || batchingValidations;

  // Prevent page unload when processing
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (deannotatingCount > 0 || batchingValidations || isChangingStartDate) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [deannotatingCount, batchingValidations, isChangingStartDate]);

  const batchValidationsOverTime = async (
    inValidations: CourseValidation<Course, any, any>[],
    batchSize: number = 10,
    delay = 2
  ) => {
    let localValidations = [...validations];
    inValidations = inValidations.filter(courseSpecificTestFilter);

    for (let i = 0; i < inValidations.length; i += batchSize) {
      const batch = inValidations.slice(i, i + batchSize);
      localValidations = [...localValidations, ...batch];
      setValidations(localValidations);

      await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    }
  };

  const runValidations = () => async () => {
    if (batchingValidations) return;
    setBatchingValidations(true);
    await batchValidationsOverTime(allValidations, 10, 2);
    setBatchingValidations(false);
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onChangeMode && onChangeMode(mode);
  }, [mode]);

  const courseSpecificTestFilter = (validation: CourseValidation<Course, any, any>) => {
    if (!validation.courseCodes) return true;
    for (const code of validation.courseCodes) {
      if (course?.parsedCourseCode?.toUpperCase().includes(code.toLocaleUpperCase("en-US"))) {
        return true;
      }
    }
    return false;
  };

  useEffectAsync(async () => {
    if (!course) return;

    if (course.isDev) {
      setButtonText("DEV Content Changes/Fixes");
    } else if (course.isBlueprint()) {
      setButtonText("BP Content Fixes");
    } else {
      setButtonText("Can Only Fix from BP or DEV");
    }
  }, [course]);

  /* increment and decrement is loading just in case we end up setting it asynchronously somehow */
  function startLoading() {
    setLoadingCount(1);
    setFailedItems([]);
    setAffectedItems([]);
    setUnaffectedItems([]);
  }

  function isDisabled() {
    if (!course) return true;
    return !(course.isBlueprint() || course.isDev);
  }

  function endLoading() {
    setLoadingCount(0);
    console.log(deannotatingCount, "-");
    if (deannotatingCount < 0) throw new MismatchedUnloadError();
  }

  function isRemovingAnnotations() {
    return deannotatingCount > 0;
  }

  async function removeLmAnnotations() {
    assert(course);
    startLoading();

    function pageToLink(page: Page) {
      return (
        <a className="course-link" target="_blank" href={page.htmlContentUrl}>
          {page.name}
        </a>
      );
    }

    const results = await fixLmAnnotations(course);
    setAffectedItems(results.fixedPages.map(pageToLink));
    setUnaffectedItems(results.unchangedPages.map(pageToLink));
    setFailedItems(results.failedPages.map(pageToLink));
    endLoading();
  }

  function urlRows(links: React.ReactElement[], className = "lxd-cu") {
    return links.map((link, i) => (
      <div key={i} className={["row", className].join(" ")}>
        {link}
      </div>
    ));
  }

  function setStartDateOutcome(outcome: string) {
    if (outcome === "success") {
      setStartDateSetMode(true);
    } else {
      setError(outcome);
    }
  }

  const toggleStartDateUI = () => {
    setShowUpdateStartDate((current) => !current);
  };

  // This is the styling of the course update interface
  function FixesMode({ course }: { course: Course }) {
    return (
      <>
        <h2>Content Fixes for {course.name}</h2>
        {course.isBlueprint() && <RemoveAnnotationsSection />}

        <Button onClick={() => toggleStartDateUI()} disabled={isChangingStartDate}>
          Update Start Date
        </Button>

        <hr />

        {showUpdateStartDate && (
          <UpdateStartDate
            setAffectedItems={setAffectedItems}
            setUnaffectedItems={setUnaffectedItems}
            setFailedItems={setFailedItems}
            refreshCourse={refreshCourse}
            course={course}
            setStartDateOutcome={setStartDateOutcome}
            isDisabled={deannotatingCount > 0}
            startLoading={startLoading}
            endLoading={endLoading}
            onStartDateChangeStart={() => setIsChangingStartDate(true)}
            onStartDateChangeEnd={() => setIsChangingStartDate(false)}
          />
        )}

        <hr />

        <Button onClick={runValidations()} disabled={runValidationsDisabled}>
          {batchingValidations ? "Loading Validations..." : "Run Validations"}
        </Button>
        {affectedItems.length > 0 && <h3>Fixes Succeeded</h3>}
        {urlRows(affectedItems, "lxd-cu-success")}
        {failedItems.length > 0 && <h3>Fix is Broken, Content Unchanged</h3>}
        {urlRows(failedItems, "lxd-cu-fail")}
      </>
    );
  }

  function RemoveAnnotationsSection() {
    return (
      course?.isBlueprint() && (
        <div className={"row"}>
          <div className={"col-sm-4"}>
            <Button onClick={removeLmAnnotations} disabled={deannotatingCount > 0}>
              Remove Annotation Placeholder
            </Button>
          </div>
          <div className={"col-sm-8"}>Removes annotation placeholders on Learning Material pages</div>
        </div>
      )
    );
  }

  return (
    course && (
      <>
        <Button disabled={isDisabled()} role={"button"} className={"ui-button"} onClick={(e) => setShow(true)}>
          {buttonText}
        </Button>
        <Modal isOpen={show} requestClose={() => setShow(false)} canClose={!deannotatingCount && !isChangingStartDate}>
          <div className={"d-flex justify-content-end"}>
            {mode === "fix" && <Button onClick={() => setMode("unitTest")}>Show All Tests</Button>}
            {mode === "unitTest" && <Button onClick={() => setMode("fix")}>Hide Successful Tests</Button>}
          </div>
          {mode === "fix" && <FixesMode course={course}></FixesMode>}
          {["fix", "unitTest"].includes(mode) && (
            <CourseValidator
              showOnlyFailures={mode !== "unitTest"}
              course={course}
              refreshCourse={refreshCourse}
              tests={validations}
            />
          )}
        </Modal>
      </>
    )
  );
}
