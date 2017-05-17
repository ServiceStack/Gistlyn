import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactGA from 'react-ga';
import { Provider, connect } from 'react-redux';
import { ServerEventsClient, ServerEventConnect, humanize } from 'servicestack-client';

import { App } from './app';

import { store } from './state';
import { client, statusToError, UA, BatchItems, evalExpression } from './utils';
import { GetScriptVariables, ScriptExecutionResult } from './Gistlyn.dtos';

import InadequateBrowserDialog from './InadequateBrowserDialog';

ReactGA.initialize("UA-80898009-1");

if (UA.nosse) {
    ReactGA.event({ category: 'error', action: 'load', label: "nosse" });

    ReactDOM.render(
        <InadequateBrowserDialog />,
        document.getElementById("app"));

    throw "This browser does not support Server Sent Events";
}

const ScriptStatusError = ["Cancelled", "CompiledWithErrors", "ThrowedException"];
const batchLogs = new BatchItems(30, logs => store.dispatch({ type: 'CONSOLE_LOG', logs }));

const channels = ["gist"];
const sse = new ServerEventsClient("/", channels, {
    handlers: {
        onConnect(activeSub: ServerEventConnect) {
            store.dispatch({ type: 'SSE_CONNECT', activeSub });
            ReactGA.set({ userId: activeSub.userId });
            fetch("/session-to-token", { method:"POST", credentials:"include" });
        },
        ConsoleMessage(m, e) {
            batchLogs.queue({ msg: m.message });
        },
        ScriptExecutionResult(m: ScriptExecutionResult, e) {
            if (m.status === store.getState().scriptStatus) return;

            if (ScriptStatusError.indexOf(m.status) >= 0 && m.errorResponseStatus) {
                batchLogs.queue(statusToError(m.errorResponseStatus));
            } else {
                batchLogs.queue({ msg: humanize(m.status) });
            }

            store.dispatch({ type: 'SCRIPT_STATUS', scriptStatus: m.status });

            if (m.status === "CompiledWithErrors" && m.errors) {
                const errorMsgs = m.errors.map(e => ({ msg: e.info, cls: "error" }));
                errorMsgs.forEach(m =>  batchLogs.queue(m));
            } else if (m.status === "Completed") {
                const request = new GetScriptVariables();
                const state = store.getState();
                request.scriptId = state.activeSub.id;
                client.get(request)
                    .then(r => {
                        store.dispatch({ type: "VARS_LOAD", variables: r.variables });
                    });

                if (state.expression) {
                    evalExpression(state.gist, state.activeSub.id, state.expression);
                }
            }
        }
    }
}).start();

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById("app"));
