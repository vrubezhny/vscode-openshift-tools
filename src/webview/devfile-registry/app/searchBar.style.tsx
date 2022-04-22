/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/

import { Theme, createStyles } from '@material-ui/core/styles';

export default (_theme: Theme) =>
    createStyles({
        searchBar: {
            display: 'flex',
            paddingTop: '1rem',
            paddingRight: '1rem'
        },

        searchBarInput: {
            flex: '1 1 0%',
            marginLeft:'1.5rem!important'
        }
    });
