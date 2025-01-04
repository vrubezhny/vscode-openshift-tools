/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WebviewErrorBoundary } from '../../common/webviewErrorBoundary.js';
import CreateDeployment from '../pages/createDeployment.js';

ReactDOM.render(
    <WebviewErrorBoundary webviewName="createDeployment">
        <CreateDeployment />
    </WebviewErrorBoundary>,
    document.getElementById('root'),
);
