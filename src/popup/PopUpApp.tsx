import { useState } from "react";
import { runtime, storage, tabs } from "webextension-polyfill";
import "../css/source.scss";
import "./PopUpApp.scss";
import "bootstrap";
import { useEffectAsync } from "../ui/utils";
import { Form } from "react-bootstrap";
import { OPEN_AI_API_KEY_KEY, SUB_ACCOUNT } from "../consts";

function PopUpApp() {
  const [advanced, setAdvanced] = useState(false);
  return (
    <div className="PopUpApp container text-center">
      <div className={["d-flex", "flex-row-reverse"].join(" ")}>
        <Form.Check
          type={"switch"}
          label={"Advanced Options"}
          checked={advanced}
          onChange={(e) => setAdvanced(e.target.checked)}
        />
      </div>
      <CourseNavigation></CourseNavigation>
      <SalesforceNavigation></SalesforceNavigation>
      {advanced && (
        <>
          <SetOpenAiKey></SetOpenAiKey>
        </>
      )}
    </div>
  );
}

function CourseNavigation() {
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [queryString, setQueryString] = useState<string | null>(null);
  const [subAccount, setSubAccount] = useState<number>(() => {
    const saved = localStorage.getItem(SUB_ACCOUNT);
    return saved ? parseInt(saved, 10) : 169877;
  });
  const [error, setError] = useState<string | null>(null);

  async function submitQuery(queryString: string | null, subAccount: number | null) {
    setIsDisabled(true);
    if (!navigator.onLine) {
      setError("Check internet connection and try again.");
      return;
    }
    const response = await runtime.sendMessage({
      searchForCourse: { queryString, subAccount },
    });
    console.log(response);
    setIsDisabled(false);
    //If submitQuery does not receive a true back from sendMessage, alert the user
    if (!response.success) {
      setError(response.error);
    }
  }

  return (
    <div className="col card-body search-box">
      <h1>Course Navigation</h1>
      {error && <div className="alert alert-warning">{error}</div>}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          localStorage.setItem(SUB_ACCOUNT, subAccount.toString());
          setError(null);
          if (!queryString) {
            setError("Please enter a search query.");
            return;
          }
          if (!subAccount) {
            setError("Please select a subaccount.");
            return;
          }
          await submitQuery(queryString, subAccount);
        }}
      >
        <div className="row">
          <input
            disabled={isDisabled}
            autoFocus
            id="search-box"
            type="text"
            placeholder="Enter search here"
            onChange={(e) => setQueryString(e.target.value)}
          ></input>
          <select
            disabled={isDisabled}
            value={subAccount ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setSubAccount(parseInt(val, 10));
            }}
          >
            <option value="">Pick account/subaccount</option>
            <option value="169877">Distance Education</option>
            <option value="170329">Distance Education Development</option>
            <option value="98244">Unity College</option>
          </select>
        </div>
        <div className={"col"}>
          <button disabled={isDisabled} className="btn">
            Search
          </button>
        </div>
      </form>
    </div>
  );
}

function SalesforceNavigation() {
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [option, setOption] = useState<string>(" ");
  const [_queryString, _setQueryString] = useState<string | null>(null);
  const [_textEntryEnabled, setTextEntryEnabled] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasCourseCode, setCanvasCourseCode] = useState<string | null>(null);

  const learningMaterialsReportUrl = buildSalesforceReportUrl("00OUH000005LkRZ2A0");
  const filteredLearningMaterialsReportUrl = canvasCourseCode
    ? buildSalesforceReportUrl("00OUH000005LkRZ2A0", 4, canvasCourseCode)
    : learningMaterialsReportUrl;

  useEffectAsync(async () => {
    try {
      const [activeTab] = await tabs.query({ active: true, currentWindow: true });
      const extractedCourseCode = await extractCanvasCourseCodeFromUrl(activeTab?.url ?? null);
      setCanvasCourseCode(extractedCourseCode);
    } catch (e) {
      console.warn("Unable to inspect active tab for Canvas course code:", e);
      setCanvasCourseCode(null);
    }
  }, []);

  /*This isn't currently working, but I'm leaving it because it's closer than not and would be a nice feature to have.
    async function getCourseCodeFromCanvas() {
        // Get the active tab's URL to check if we're on a Canvas course page
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if(!activeTab?.url) return;

        if(activeTab.url.includes("unity.instructure.com/courses")) {

        }
    }*/

  return (
    <div className="col card-body search-box">
      <h1>Salesforce Navigation</h1>
      {error && <div className="alert alert-warning">{error}</div>}
      <div className="row">
        <select
          disabled={isDisabled}
          value={option ?? " "}
          onChange={(e) => {
            setIsDisabled(true);
            setOption(e.target.value);
            if (e.target.value === "section-check-ug") {
              window.open(
                "https://unityenvironmentaluniversity.lightning.force.com/lightning/r/Report/00OUH000006CnKr2AK/view?queryScope=userFolderss",
                "_blank"
              );
            } else if (e.target.value === "section-check-grad") {
              window.open(
                "https://unityenvironmentaluniversity.lightning.force.com/lightning/r/Report/00OUH000004JNrR2AW/view?queryScope=userFolders",
                "_blank"
              );
            } else if (e.target.value === "course-offerings") {
              window.open(
                "https://unityenvironmentaluniversity.lightning.force.com/lightning/r/Report/00OUH000004Undh2AC/view?queryScope=userFolders",
                "_blank"
              );
            } else if (e.target.value === "course-materials") {
              window.open(filteredLearningMaterialsReportUrl, "_blank");
            } else if (["learning-course", "course-material"].includes(e.target.value)) {
              /*getCourseCodeFromCanvas().then(r => {
                            if(r) {
                                setQueryString(r);
                            }
                        });*/
              setTextEntryEnabled(true);
            } else {
              setError("Invalid Salesforce page selected");
            }
            setIsDisabled(false);
          }}
        >
          <option value="">Pick Salesforce page:</option>
          <option value="section-check-ug">Undergrad Section Check</option>
          <option value="section-check-grad">Grad Section Check</option>
          <option value="course-offerings">Unique Course Offerings by Term</option>
          <option value="course-materials">Learning Materials Report</option>
          {/* Commenting these out because they're going to require API calls to Salesforce, which we're still working on.
                <option value="learning-course">Learning Course</option>
                <option value="course-material">Course Material</option>*/}
        </select>
      </div>
      {/*This is scaffolding for the text entry box, which still needs some work to be functional. Uncomment when we want to implement learning course and course material search
        {textEntryEnabled &&
            <form onSubmit={async (e) => {
                if(!navigator.onLine) {
                    setError("Check internet connection and try again.");
                    return;
                }
                e.preventDefault();
                setIsDisabled(true);
                setError("Not implemented yet");
                if(!queryString) {
                    setError("Please enter a search query.")
                }
                //Search for matching course in Salesforce
                //if found, pull that course's Salesforce ID
                    //if value===learning-course, open learning course page in Salesforce
                    //if value===course-material, open course material page in Salesforce
                //if not found, tell user
                setIsDisabled(false);
            }}>
                <div className="row">
                    <input
                        disabled={isDisabled}
                        id="search-box"
                        type='text'
                        //Implement placeholder text to be the course code if the user is on a Canvas course page
                        value={queryString ?? ''}
                        placeholder='Enter course code here'
                        onChange={(e) => setQueryString(e.target.value)}
                    ></input>
                    <div className={'col'}>
                        <button disabled={isDisabled} className="btn">Search</button>
                    </div>
                </div>
            </form>
        }.*/}
    </div>
  );
}

function buildSalesforceReportUrl(reportId: string, filterIndex?: number, filterValue?: string) {
  const baseUrl = `https://unityenvironmentaluniversity.lightning.force.com/lightning/r/Report/${reportId}/view`;
  if (typeof filterIndex !== "number" || typeof filterValue !== "string" || filterValue.length === 0) {
    return `${baseUrl}?queryScope=userFolders`;
  }
  const filterParam = `fv${filterIndex}=${encodeURIComponent(filterValue)}`;
  return `${baseUrl}?queryScope=userFolders&${filterParam}`;
}

async function extractCanvasCourseCodeFromUrl(url: string | null) {
  if (!url) return null;
  const canvasUrl = new URL(url);
  if (!canvasUrl.hostname.endsWith(".instructure.com") || !/\/courses\/\d+/.test(canvasUrl.pathname)) return null;

  const idRegex = /courses\/(\d+)/m;

  const match = idRegex.exec(canvasUrl.pathname);
  if (!match) return null;

  const courseId = +match[1];

  const course = await getCanvasCourseById(canvasUrl.origin, courseId);

  const courseName = course.name;
  if (!courseName) return null;

  const courseNameRegex = /([A-Za-z]{4})[\s_-]?(\d{3,4})/m;
  const courseCode = courseNameRegex.exec(courseName);

  if (!courseCode || !courseCode[1] || !courseCode[2]) return null;

  const formattedCourseCode = `${courseCode[1].toUpperCase()} ${courseCode[2]}`;

  return formattedCourseCode;
}

async function getCanvasCourseById(canvasOrigin: string, courseId: number) {
  const response = await fetch(`${canvasOrigin}/api/v1/courses/${courseId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Unable to load Canvas course ${courseId}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<{ name?: string }>;
}

function SetOpenAiKey() {
  const [key, setKey] = useState<string>("");
  const [saved, _setSaved] = useState(false);
  async function saveKey(keyToSave: string) {
    await storage.local.set({ [OPEN_AI_API_KEY_KEY]: keyToSave });
  }

  useEffectAsync(async () => {
    const savedKeyRecord = await storage.local.get(OPEN_AI_API_KEY_KEY);
    const savedKey = savedKeyRecord[OPEN_AI_API_KEY_KEY] as string;
    console.log(savedKey);
    setKey(savedKey);
  }, []);

  return (
    <div className="col card-body search-box">
      <h1>OpenAI API Key</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          saveKey(key);
        }}
      >
        <div className="row">
          <input
            id="open-api-key"
            type="text"
            value={key}
            placeholder="Enter search here"
            onChange={(e) => setKey(e.target.value)}
          ></input>
        </div>
        <div className={"col"}>
          <button className="btn" onClick={() => saveKey(key)}>
            Save API Key
          </button>
          {saved && <h4>Saved</h4>}
        </div>
      </form>
    </div>
  );
}

export default PopUpApp;
