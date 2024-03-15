import {useState} from "react";
import {runtime} from "webextension-polyfill";

async function submitQuery(queryString: string | null) {
    console.log(queryString)
    await runtime.sendMessage({
        searchForCourse: queryString
    });
}

function App() {

    const [queryString, setQueryString] = useState<string | null>(null)
    return (
        <div className="App">
            <label></label>
            <form onSubmit={async (e) => {
                e.preventDefault();
                await submitQuery(queryString)
            }}>
                <input
                    autoFocus
                    id="search-box"
                    type='text'
                    placeholder='DEV_TEST000|w1a1'
                    onChange={(e) => setQueryString(e.target.value)}
                ></input>
            </form>
        </div>
    );
}

export default App;