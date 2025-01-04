/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/

import * as fs from 'fs-extra';
import * as path from 'path';
import { backupKubeConfig, loadKubeConfigFromBackup } from './common/kubeConfigUtils.js';
import { checkExtension } from './suite/extension.js';
import { kubernetesContextTest } from './suite/kubernetesContext.js';
import { loginTest } from './suite/login.js';
import { checkOpenshiftView } from './suite/openshift.js';
import { projectTest } from './suite/project.js';

describe('Extension cluster-dependant UI tests', function () {
    const contextFolder = path.join(__dirname, 'context');

    // test with an empty kube config, make a backup, wipe the context folder
    before(async function () {
        await backupKubeConfig();
        await fs.emptyDir(contextFolder);
    });

    // restore the kube config backup after test
    after(async function () {
        await loadKubeConfigFromBackup();
    });

    checkExtension();
    checkOpenshiftView();
    loginTest();
    projectTest(true);
    kubernetesContextTest(true);
});