import {useState} from "react";
import {runtime} from "webextension-polyfill";
import "../css/source.scss"
import "./PopUpApp.scss"
import 'bootstrap'

function PopUpApp() {
    const [isDisabled, setIsDisabled] = useState<boolean>(false)
    const [queryString, setQueryString] = useState<string | null>(null)

    async function submitQuery(queryString: string | null) {
        setIsDisabled(true);
        await runtime.sendMessage({
            searchForCourse: queryString
        });
        setIsDisabled(false);
    }

    return (
        <div className="PopUpApp container text-center">
            <div className="col card-body search-box">
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
        </div>
    );
}

export default PopUpApp;