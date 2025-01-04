/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WebviewErrorBoundary } from '../../common/webviewErrorBoundary.js';
import { VSCodeMessage } from './vsCodeMessage.js';
import { Welcome } from './welcomePage.js';

VSCodeMessage.postMessage({
    'action': 'getOpenShiftVersion'
})

VSCodeMessage.postMessage({
    'action': 'getShowWelcomePageConfig'
});

ReactDOM.render(
    <WebviewErrorBoundary webviewName='welcome'>
        <Welcome />
    </WebviewErrorBoundary>,
    document.getElementById('root'),
);
