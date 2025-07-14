import {useEffect, useState} from "react";
import {runtime, storage} from "webextension-polyfill";
import "../css/source.scss"
import "./PopUpApp.scss"
import 'bootstrap'
import {useEffectAsync} from "../ui/utils";
import { Form } from "react-bootstrap";
import {OPEN_AI_API_KEY_KEY, SUB_ACCOUNT} from "../consts";

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
            {advanced && <>
                <SetOpenAiKey></SetOpenAiKey>
            </>}
        </div>
    );
}

function CourseNavigation() {
    const [isDisabled, setIsDisabled] = useState<boolean>(false)
    const [queryString, setQueryString] = useState<string | null>(null)
    const [subAccount, setSubAccount] = useState<number>(169877)
    const [error, setError] = useState<string | null>(null)

    async function submitQuery(queryString: string | null, subAccount: number | null) {
        setIsDisabled(true);
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
            setError(null);
            if(!queryString) {
                setError("Please enter a search query.")
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
