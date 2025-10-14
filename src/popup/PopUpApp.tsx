import {useState} from "react";
import {runtime, storage} from "webextension-polyfill";
import "../css/source.scss"
import "./PopUpApp.scss"
import 'bootstrap'
import {useEffectAsync} from "../ui/utils";
import { Form } from "react-bootstrap";
import {OPEN_AI_API_KEY_KEY, SUB_ACCOUNT} from "../consts";
import browser from "webextension-polyfill";

function PopUpApp() {
    const [advanced, setAdvanced] = useState(false);
    return (
        <div className="PopUpApp container text-center">
            <div className={['d-flex', 'flex-row-reverse'].join(' ')}>
                <Form.Check
                    type={'switch'}
                    label={'Advanced Options'}
                    checked={advanced}
                    onChange={(e) => setAdvanced(e.target.checked)}
                />
            </div>
            <CourseNavigation></CourseNavigation>
            <SalesforceNavigation></SalesforceNavigation>
            {advanced && <>
                <SetOpenAiKey></SetOpenAiKey>
            </>}
        </div>
    );
}

function CourseNavigation() {
    const [isDisabled, setIsDisabled] = useState<boolean>(false)
    const [queryString, setQueryString] = useState<string | null>(null)
    const [subAccount, setSubAccount] = useState<number>(() => {
        const saved = localStorage.getItem(SUB_ACCOUNT);
        return saved ? parseInt(saved, 10) : 169877;
    })
    const [error, setError] = useState<string | null>(null)

    async function submitQuery(queryString: string | null, subAccount: number | null) {
        setIsDisabled(true);
        if(!navigator.onLine) {
            setError("Check internet connection and try again.");
            return;
        }
        const response = await runtime.sendMessage({
            searchForCourse: { queryString, subAccount }
        });
        console.log(response);
        setIsDisabled(false);
        //If submitQuery does not receive a true back from sendMessage, alert the user
        if(!response.success) {
            setError(response.error);
        }
    }

    return <div className="col card-body search-box">
        <h1>Course Navigation</h1>
        {error && <div className="alert alert-warning">{error}</div>}
        <form onSubmit={async (e) => {
            e.preventDefault();
            localStorage.setItem(SUB_ACCOUNT, subAccount.toString());
            setError(null);
            if(!queryString) {
                setError("Please enter a search query.")
                return;
            }
            if(!subAccount) {
                setError("Please select a subaccount.")
                return;
            }
            await submitQuery(queryString, subAccount)
        }}>
            <div className="row">
                <input
                    disabled={isDisabled}
                    autoFocus
                    id="search-box"
                    type='text'
                    placeholder='Enter search here'
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
            <div className={'col'}>

                <button disabled={isDisabled} className="btn">Search</button>
            </div>
        </form>
    </div>
}

function SalesforceNavigation() {
    const [ isDisabled, setIsDisabled ] = useState<boolean>(false);
    const [ option, setOption ] = useState<string>(" ");
    const [ queryString, setQueryString ] = useState<string | null>(null);
    const [ textEntryEnabled, setTextEntryEnabled ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);

    /*This isn't currently working, but I'm leaving it because it's closer than not and would be a nice feature to have.
    async function getCourseCodeFromCanvas() {
        // Get the active tab's URL to check if we're on a Canvas course page
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if(!activeTab?.url) return;

        if(activeTab.url.includes("unity.instructure.com/courses")) {

        }
    }*/

    return <div className="col card-body search-box">
        <h1>Salesforce Navigation</h1>
        {error && <div className="alert alert-warning">{error}</div>}
        <div className="row">
            <select
                disabled={isDisabled}
                value={option ?? " "}
                onChange={(e) => {
                    setIsDisabled(true);
                    setOption(e.target.value);
                    if (e.target.value === "section-check") {
                        window.open("https://unityenvironmentaluniversity.lightning.force.com/lightning/r/Report/00OUH000004JNrR2AW/view?queryScope=userFolders", "_blank");
                    } else if(e.target.value === "course-offerings") {
                        window.open("https://unityenvironmentaluniversity.lightning.force.com/lightning/r/Report/00OUH000004Undh2AC/view?queryScope=userFolders", "_blank");
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
                <option value="section-check">Section Check</option>
                <option value="course-offerings">Unique Course Offerings by Term</option>
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
}

function SetOpenAiKey() {
    const [key, setKey] = useState<string>('');
    const [saved, setSaved] = useState(false);
    async function saveKey(keyToSave:string) {
        await storage.local.set({ [OPEN_AI_API_KEY_KEY] : keyToSave});
    }

    useEffectAsync(async () => {
            const savedKeyRecord = await storage.local.get(OPEN_AI_API_KEY_KEY);
            const savedKey = savedKeyRecord[OPEN_AI_API_KEY_KEY] as string;
            console.log(savedKey);
            setKey(savedKey);
    }, []);


    return <div className="col card-body search-box">
        <h1>OpenAI API Key</h1>
        <form onSubmit={async (e) => {
            e.preventDefault();
            saveKey(key);
        }}>
            <div className="row">
                <input
                    id="open-api-key"
                    type='text'
                    value={key}
                    placeholder='Enter search here'
                    onChange={(e) => setKey(e.target.value)}
                ></input>
            </div>
            <div className={'col'}>
                <button className="btn" onClick={()=> saveKey(key)}>Save API Key</button>
                {saved && <h4>Saved</h4>}
            </div>
        </form>
    </div>

}

export default PopUpApp;
