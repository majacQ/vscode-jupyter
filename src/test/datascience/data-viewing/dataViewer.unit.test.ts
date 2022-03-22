// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import { anything, instance, mock, verify, when } from 'ts-mockito';
import { ConfigurationChangeEvent, EventEmitter } from 'vscode';
import { ApplicationShell } from '../../../platform/common/application/applicationShell';
import {
    IApplicationShell,
    IWebviewPanelProvider,
    IWorkspaceService
} from '../../../platform/common/application/types';
import { WebviewPanelProvider } from '../../../platform/common/application/webviewPanels/webviewPanelProvider';
import { WorkspaceService } from '../../../platform/common/application/workspace';
import { JupyterSettings } from '../../../platform/common/configSettings';
import { ConfigurationService } from '../../../platform/common/configuration/service';
import { IConfigurationService } from '../../../platform/common/types';
import { CodeCssGenerator } from '../../../platform/datascience/codeCssGenerator';
import { DataViewer } from '../../../platform/datascience/data-viewing/dataViewer';
import { JupyterVariableDataProvider } from '../../../platform/datascience/data-viewing/jupyterVariableDataProvider';
import { IDataViewer, IDataViewerDataProvider } from '../../../platform/datascience/data-viewing/types';
import { ThemeFinder } from '../../../platform/datascience/themeFinder';
import { ICodeCssGenerator, IDataScienceErrorHandler, IThemeFinder } from '../../../platform/datascience/types';
import { MockMemento } from '../../mocks/mementos';

suite('DataScience - DataViewer', () => {
    let dataViewer: IDataViewer;
    let webPanelProvider: IWebviewPanelProvider;
    let configService: IConfigurationService;
    let codeCssGenerator: ICodeCssGenerator;
    let themeFinder: IThemeFinder;
    let workspaceService: IWorkspaceService;
    let applicationShell: IApplicationShell;
    let dataProvider: IDataViewerDataProvider;
    const title: string = 'Data Viewer - Title';

    setup(async () => {
        webPanelProvider = mock(WebviewPanelProvider);
        configService = mock(ConfigurationService);
        codeCssGenerator = mock(CodeCssGenerator);
        themeFinder = mock(ThemeFinder);
        workspaceService = mock(WorkspaceService);
        applicationShell = mock(ApplicationShell);
        dataProvider = mock(JupyterVariableDataProvider);
        const settings = mock(JupyterSettings);
        const settingsChangedEvent = new EventEmitter<void>();

        when(settings.onDidChange).thenReturn(settingsChangedEvent.event);
        when(configService.getSettings(anything())).thenReturn(instance(settings));

        const configChangeEvent = new EventEmitter<ConfigurationChangeEvent>();
        when(workspaceService.onDidChangeConfiguration).thenReturn(configChangeEvent.event);

        when(dataProvider.getDataFrameInfo(anything(), anything())).thenResolve({});

        dataViewer = new DataViewer(
            instance(webPanelProvider),
            instance(configService),
            instance(codeCssGenerator),
            instance(themeFinder),
            instance(workspaceService),
            instance(applicationShell),
            new MockMemento(),
            instance(mock<IDataScienceErrorHandler>())
        );
    });
    test('Data viewer showData calls gets dataFrame info from data provider', async () => {
        await dataViewer.showData(instance(dataProvider), title);

        verify(dataProvider.getDataFrameInfo(anything(), anything())).once();
    });
    test('Data viewer calls data provider dispose', async () => {
        await dataViewer.showData(instance(dataProvider), title);
        dataViewer.dispose();

        verify(dataProvider.dispose()).once();
    });
});
