import React from 'react';
import ReactDOM from 'react-dom/client';
import {ReportingApp} from "@/reporting/ReportingApp";
import {persistor, reportingStore} from "@/reporting/data/reportingStore";
import {Provider} from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
const leftSide = document.body.querySelector("#left-side #section-tabs")

 if(leftSide) {
    const root = document.createElement("li")
    leftSide.insertAdjacentElement("afterbegin", root);
    const rootDiv = ReactDOM.createRoot(root);
    rootDiv.render(
        <React.StrictMode>
            <Provider store={reportingStore}>
                <PersistGate loading={null} persistor={persistor}>
                    <ReportingApp/>
                </PersistGate>
            </Provider>
        </React.StrictMode>
    );

 }




