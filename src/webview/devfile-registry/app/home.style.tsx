/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/

import { Theme, createStyles } from '@material-ui/core/styles';

export default (_theme: Theme) =>
    createStyles({
        devfileGalleryGrid: {
            paddingTop: '1rem',
            color: 'var(--vscode-foreground)',
            backgroundColor: 'var(--vscode-editor-background)',
            fontSize: 'var(--vscode-font-size)',
            fontFamily: 'var(--vscode-font-family)',
        },
    });
