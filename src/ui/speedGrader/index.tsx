// This implementation modified from https://github.com/UCBoulder/canvas-userscripts

import ExportApp from "./ExportApp"
import assert from "assert";
import ReactDOM from "react-dom/client";
import React from "react";

const rootContainer = document.querySelector('#gradebook_header div.statsMetric')
const root = document.createElement("span")
assert(rootContainer);
rootContainer?.appendChild(root);
const rootDiv = ReactDOM.createRoot(root);

rootDiv.render(
    <React.StrictMode>
        <ExportApp/>
    </React.StrictMode>
)