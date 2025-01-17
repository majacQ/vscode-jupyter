// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import { inject, injectable } from 'inversify';
import { SessionDisposedError } from '../errors/sessionDisposedError';
import {
    ConnectNotebookProviderOptions,
    NotebookCreationOptions,
    IJupyterConnection,
    IJupyterNotebookProvider,
    IJupyterServerProvider,
    INotebook
} from '../types';

// When the NotebookProvider looks to create a notebook it uses this class to create a Jupyter notebook
@injectable()
export class JupyterNotebookProvider implements IJupyterNotebookProvider {
    constructor(@inject(IJupyterServerProvider) private readonly serverProvider: IJupyterServerProvider) {}

    public async disconnect(options: ConnectNotebookProviderOptions): Promise<void> {
        const server = await this.serverProvider.getOrCreateServer(options);

        return server?.dispose();
    }

    public async connect(options: ConnectNotebookProviderOptions): Promise<IJupyterConnection | undefined> {
        const server = await this.serverProvider.getOrCreateServer(options);
        return server?.getConnectionInfo();
    }

    public async createNotebook(options: NotebookCreationOptions): Promise<INotebook> {
        // Make sure we have a server
        const server = await this.serverProvider.getOrCreateServer({
            getOnly: false,
            disableUI: options.disableUI,
            resource: options.resource,
            token: options.token
        });

        if (server) {
            return server.createNotebook(options.resource, options.kernelConnection, options.token);
        }
        // We want createNotebook to always return a notebook promise, so if we don't have a server
        // here throw our generic server disposed message that we use in server creatio n
        throw new SessionDisposedError();
    }
}
