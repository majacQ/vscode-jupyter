// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';

import { IJupyterExtraSettings } from '../../platform/datascience/types';

// From a set of data science settings build up any settings that need to be
// inserted into our StyleSetter divs some things like pseudo elements
// can't be put into inline styles
export function buildSettingsCss(settings: IJupyterExtraSettings | undefined): string {
    return settings
        ? `#main-panel-content::-webkit-scrollbar {
    width: ${settings.extraSettings.editor.verticalScrollbarSize}px;
}

.cell-output::-webkit-scrollbar {
    height: ${settings.extraSettings.editor.horizontalScrollbarSize}px;
}

.cell-output > *::-webkit-scrollbar {
    width: ${settings.extraSettings.editor.verticalScrollbarSize}px;
}`
        : '';
}
