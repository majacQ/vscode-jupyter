// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import { WidgetScriptSource } from '../../../../kernels/ipywidgets-message-coordination/types';
import { logMessage } from '../../react-common/logger';

type NonPartial<T> = {
    [P in keyof T]-?: T[P];
};

// Key = module name, value = path to script.
const scriptsAlreadyRegisteredInRequireJs = new Map<string, string>();

function getScriptsToBeRegistered(scripts: WidgetScriptSource[]) {
    return scripts.filter((script) => {
        // Ignore scripts that have already been registered once before.
        if (
            scriptsAlreadyRegisteredInRequireJs.has(script.moduleName) &&
            scriptsAlreadyRegisteredInRequireJs.get(script.moduleName) === script.scriptUri
        ) {
            return false;
        }
        return true;
    });
}

function getScriptsWithAValidScriptUriToBeRegistered(scripts: WidgetScriptSource[]) {
    return scripts
        .filter((source) => {
            if (source.scriptUri) {
                // eslint-disable-next-line no-console
                logMessage(
                    `Source for IPyWidget ${source.moduleName} found in ${source.source} @ ${source.scriptUri}.`
                );
                return true;
            } else {
                // eslint-disable-next-line no-console
                console.error(`Source for IPyWidget ${source.moduleName} not found.`);
                return false;
            }
        })
        .map((source) => source as NonPartial<WidgetScriptSource>);
}

function getRequireJs() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requireJsFunc = (window as any).requirejs as { config: Function; define: Function };
    if (!requireJsFunc) {
        window.console.error('Requirejs not found');
        throw new Error('Requirejs not found');
    }
    return requireJsFunc;
}
function registerScriptsInRequireJs(scripts: NonPartial<WidgetScriptSource>[]) {
    const requireJsFunc = getRequireJs();
    const config: { paths: Record<string, string> } = {
        paths: {}
    };
    registerCustomScripts();

    scripts.forEach((script) => {
        logMessage(`Registering IPyWidget ${script.moduleName} found in ${script.scriptUri}.`);
        scriptsAlreadyRegisteredInRequireJs.set(script.moduleName, script.scriptUri);
        // Drop the `.js` from the scriptUri.
        const scriptUri = script.scriptUri.toLowerCase().endsWith('.js')
            ? script.scriptUri.substring(0, script.scriptUri.length - 3)
            : script.scriptUri;
        // Register the script source into requirejs so it gets loaded via requirejs.
        config.paths[script.moduleName] = scriptUri;
    });

    requireJsFunc.config(config);
}

export function registerScripts(scripts: WidgetScriptSource[]) {
    const scriptsToRegister = getScriptsToBeRegistered(scripts);
    const validScriptsToRegister = getScriptsWithAValidScriptUriToBeRegistered(scriptsToRegister);
    registerScriptsInRequireJs(validScriptsToRegister);
}

function registerCustomScripts() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((registerCustomScripts as any).invoked) {
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (registerCustomScripts as any).invoked = true;
    getRequireJs().config({
        map: {
            '*': {
                'jupyter-js-widgets': '@jupyter-widgets/base'
            }
        }
    });
}