/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WebviewErrorBoundary } from '../../common/webviewErrorBoundary.js';
import { ManageRepository } from './home.js';

ReactDOM.render(
    <WebviewErrorBoundary webviewName='helmManageRepository'>
        <ManageRepository />
    </WebviewErrorBoundary>,
    document.getElementById('root'),
);
