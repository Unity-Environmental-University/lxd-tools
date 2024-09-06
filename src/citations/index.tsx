import React from 'react';
import ReactDOM from 'react-dom/client';
import CitationsApp from "@/citations/CitationsApp";
import {Provider} from "react-redux";
import {store} from "@/citations/store";

const root = document.createElement("div")


const rootDiv = ReactDOM.createRoot(root);

rootDiv.render(
    <React.StrictMode>
        <Provider store={store}>
        <CitationsApp/>
        </Provider>
    </React.StrictMode>
);

