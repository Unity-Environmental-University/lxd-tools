import React from 'react';
import ReactDOM from 'react-dom/client';
import PublishApp from "./PublishApp";
//comment for publish test
const root = document.createElement("div")
let courseStatusEl = document.body.querySelector("#course_status")
const sidebarEl = document.getElementById('right-side');
let rootAnchor: Element;
if(courseStatusEl) {
    courseStatusEl.append(root)
} else if(sidebarEl) {
    sidebarEl.insertBefore(root, sidebarEl.firstElementChild)
}


const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
    <React.StrictMode>
        <PublishApp/>
    </React.StrictMode>
);

