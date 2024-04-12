import {useEffect, useState} from "react";
import {runtime, storage} from "webextension-polyfill";
import "../css/source.scss"
import "./PopUpApp.scss"
import 'bootstrap'
import {useEffectAsync} from "../ui/utils";
import FormCheckInput from "react-bootstrap/FormCheckInput";
import { Form } from "react-bootstrap";

const OPEN_AI_API_KEY_KEY = "OPEN_AI_API_KEY"
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

    async function submitQuery(queryString: string | null) {
        setIsDisabled(true);
        await runtime.sendMessage({
            searchForCourse: queryString
        });
        setIsDisabled(false);
    }

    return <div className="col card-body search-box">
        <h1>Course Navigation</h1>
        <form onSubmit={async (e) => {
            e.preventDefault();
            await submitQuery(queryString)
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
            let savedKeyRecord = await storage.local.get(OPEN_AI_API_KEY_KEY);
            let savedKey = savedKeyRecord[OPEN_AI_API_KEY_KEY] as string;
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
