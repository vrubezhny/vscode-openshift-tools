/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DevfileRegistry } from './devfileRegistry';
import { WebviewErrorBoundary } from '../../common/webviewErrorBoundary';

ReactDOM.render(
    <WebviewErrorBoundary webviewName='devfileRegistry'>
        <DevfileRegistry/>
    </WebviewErrorBoundary>,
    document.getElementById('root'),
);
