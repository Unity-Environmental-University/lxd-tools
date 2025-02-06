import React from 'react';
import ReactDOM from 'react-dom/client';
import {ReportingApp} from "@/reporting/ReportingApp";
import {reportingStore} from "@/reporting/data/reportingStore";
import {Provider} from "react-redux";
const leftSide = document.body.querySelector("#left-side #section-tabs")

 if(leftSide) {
    const root = document.createElement("li")
    leftSide.insertAdjacentElement("afterbegin", root);
    const rootDiv = ReactDOM.createRoot(root);
    rootDiv.render(
        <React.StrictMode>
            <Provider store={reportingStore}>
                <ReportingApp/>
            </Provider>
        </React.StrictMode>
    );

 }




