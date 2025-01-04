/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/
import * as React from 'react';
import { DefaultProps } from '../../common/propertyTypes.js';
import './home.scss';
import { ShowRepositories } from './showRepositories.js';
import { VSCodeMessage } from './vsCodeMessage.js';

export class ManageRepository extends React.Component<DefaultProps, object> {

    constructor(props: DefaultProps | Readonly<DefaultProps>) {
        super(props);
        VSCodeMessage.postMessage({
            action: 'getRepositoryList'
        });
    }

    render(): React.ReactNode {
        return (
            <ShowRepositories />
        )
    }
}
