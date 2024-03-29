import {useState} from "react";
import {runtime} from "webextension-polyfill";
import "./App.scss"
import 'bootstrap'

function App() {
    const [isDisabled, setIsDisabled] = useState<boolean>(false)
    const [queryString, setQueryString] = useState<string | null>(null)

    async function submitQuery(queryString: string | null) {
        console.log(queryString)
        setIsDisabled(true);
        await runtime.sendMessage({
            searchForCourse: queryString
        });
        setIsDisabled(false);
    }

    return (
        <div className="App container text-center">
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

export default App;