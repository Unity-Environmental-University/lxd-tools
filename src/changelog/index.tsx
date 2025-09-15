import React from 'react';
import ReactDOM from 'react-dom/client';
import ChangeLogApp from "./ChangeLogApp";

// TODO: Greg - determine where changelog should mount in Canvas
// Options:
// 1. Course settings page (like publish does)
// 2. New dedicated changelog page
// 3. Sidebar in various course pages

const root = document.createElement("div");
root.id = "changelog-root";

// TODO: Greg - update this selector based on where you want the changelog to appear
// Current logic mirrors publish/index.tsx pattern
const courseStatusEl = document.body.querySelector("#course_status");
const sidebarEl = document.getElementById('right-side');

if (courseStatusEl) {
    courseStatusEl.append(root);
} else if (sidebarEl) {
    sidebarEl.insertBefore(root, sidebarEl.firstElementChild);
}

const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
    <React.StrictMode>
        <ChangeLogApp/>
    </React.StrictMode>
);