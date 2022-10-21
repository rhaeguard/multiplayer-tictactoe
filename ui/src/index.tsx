import React from "react";
import ReactDOM from "react-dom/client";
import { Playground } from "./components/Playground";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { WebSocketConnectionProvider } from "./websocket";
import { setupStore } from './store';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
    <React.StrictMode>
        <Provider store={setupStore()}>
            <WebSocketConnectionProvider>
                <Playground />
            </WebSocketConnectionProvider>
        </Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
