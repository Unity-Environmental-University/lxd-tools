import React from 'react';
import ReactDOM from 'react-dom/client';
import PublishApp from "./PublishApp";
import assert from "assert";

const root = document.createElement("div")
const el = document.body.querySelector("#course_status")
assert(el);
el.append(root);

const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <React.StrictMode>
    <PublishApp />
  </React.StrictMode>
);